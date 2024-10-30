from flask import Flask, request, redirect, url_for, session, jsonify
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
import os
import random
import urllib.parse
from db import init_db, add_user, start_game, add_player
from db import db, User, Track, Game, Player
import json
import requests
import datetime
import string
from datetime import timezone

"""
Server for Guessify

Info to look into before building:
    1. How to play songs (can we play songs from Spotify on a phone?)
    2. Database information for production (duckdb works locally but 
       don't know if it will work in a production environment)


This to remeber:
    1. Create a requirements.txt file
    2. Create a proper authorization system (OAuth2 maybe?)
    3. Create a Dockerfile
    4. remove the debug=True before deploying

Routes:
    1. /login
    2. /signup
    3. /play_song
    4. /check_answers
    5. /leaderboard
    6. /profile
    7. /logout
    8. /refresh_token

Notes on error messages:
    1. 400 - Bad request (parameters missing or invalid)
    2. 401 - Unauthorized (user not logged in)
    3. 403 - Forbidden (user not allowed to access resource)
    4. 404 - Not found (resource not found)
"""


# ----------------- SETUP -----------------

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
init_db(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ------------ HELPER FUNCTIONS ------------

def generate_random_string(length):
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))

def success_response(message, status_code=200):
    return jsonify({'message': message}), status_code

def error_response(message, status_code=400):
    return jsonify({'message': message}), status_code

def check_fields(body, fields):
   missing_fields = []
   
   for field in fields:
        if field not in body:
            missing_fields.append(field)
   
   if missing_fields:
        return error_response(f'Missing fields: {", ".join(missing_fields)}')

def check_user():
    if not current_user.is_authenticated:
        return error_response('User not logged in', 401)

def user_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'spotify_token': user.spotify_token,
        'spotify_refresh_token': user.spotify_refresh_token,
        'spotify_token_expiry': user.spotify_token_expiry,
        'spotify_logged_in': user.spotify_logged_in
    }

def game_to_dict(game):
    return {
        'id': game.id,
        'game_code': game.game_code,
        'current_track_id': game.current_track_id,
        'timestamp': game.timestamp,
        'host': game.host
    }

def refresh_spotify_token(user):
    refresh_token = user.spotify_refresh_token
    client_id = 'b5d98381070641b38c70deafcae79169'
    client_secret = 'c6818fe6cb7d4f6ca9311f92609561bc'
    token_url = 'https://accounts.spotify.com/api/token'

    response = requests.post(token_url, data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': client_id,
        'client_secret': client_secret,
    })

    if response.status_code == 200:
        tokens = response.json()
        user.spotify_token = tokens['access_token']
        user.spotify_token_expiry = datetime.datetime.now(datetime.timezone.utc) \
            + datetime.timedelta(seconds=tokens['expires_in'])
        db.session.commit()
        return True
    else:
        return False


# ----------------- ROUTES -----------------



@app.route('/user/', methods=['POST'])
def create_user():

    body = json.loads(request.data)

    check_fields(body, ['username', 'password'])
    
    username = body['username']
    password = body['password']

    add_user(username, password)
    return success_response('User created')

@app.route('/user/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return error_response('User not found', 404)
    return success_response(user_to_dict(user))

@app.route('/user/login/', methods=['POST'])
def login():
    body = json.loads(request.data)

    check_fields(body, ['username', 'password'])

    username = body['username']
    password = body['password']

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return error_response('Invalid username or password', 401)

    login_user(user)
    return success_response('User logged in')

@app.route('/user/logout/', methods=['POST'])
def logout():
    check_user()
    logout_user()
    return success_response('User logged out')

@app.route('/user/spotify-login', methods=['POST'])
def spotify_login():
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401

    access_token = request.json.get('access_token')
    refresh_token = request.json.get('refresh_token')
    expires_in = request.json.get('expires_in')

    current_user.spotify_token = access_token
    current_user.spotify_refresh_token = refresh_token
    current_user.spotify_token_expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=expires_in)
    current_user.spotify_logged_in = True
    db.session.commit()
    return jsonify({'message': 'Spotify login successful'})

@app.route('/user/update-username/', methods=['POST'])
def update_username():
    if not current_user.is_authenticated:
        return error_response('User not logged in', 401)

    body = json.loads(request.data)

    check_fields(body, ['username'])

    new_username = body['username']

    current_user.username = new_username
    db.session.commit()

    return success_response('Username updated')




# ----------------- SPOTIFY AUTHENTICATION -----------------



@app.route('/user/profile', methods=['GET'])
def user_profile():
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401

    spotify_profile = None
    if current_user.spotify_logged_in:

        if current_user.spotify_token_expiry and current_user.spotify_token_expiry.tzinfo is None:
            current_user.spotify_token_expiry = current_user.spotify_token_expiry.replace(tzinfo=datetime.timezone.utc)

        if current_user.spotify_token_expiry and current_user.spotify_token_expiry \
                                                < datetime.datetime.now(datetime.timezone.utc):
            if refresh_spotify_token(current_user):
                return success_response('Spotify token refreshed')
            else:
                return error_response('Failed to refresh Spotify token')

        headers = {
            'Authorization': f'Bearer {current_user.spotify_token}'
        }
        
        response = requests.get('https://api.spotify.com/v1/me', headers=headers)

        if response.status_code == 200:
            spotify_profile = response.json()
        else:
            current_user.spotify_logged_in = False
            db.session.commit()

    user_data = {
        'username': current_user.username,
        'spotify_logged_in': current_user.spotify_logged_in,
        'spotify_profile': spotify_profile
    }
    return jsonify(user_data)


@app.route('/user/spotify-token', methods=['POST'])
def spotify_token():
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401

    code = request.json.get('code')

    client_id = 'b5d98381070641b38c70deafcae79169'
    client_secret = 'c6818fe6cb7d4f6ca9311f92609561bc'
    redirect_uri = 'http://localhost:3000/callback'
    token_url = 'https://accounts.spotify.com/api/token'

    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret,
    })

    if response.status_code == 200:
        tokens = response.json()
        current_user.spotify_token = tokens['access_token']
        current_user.spotify_refresh_token = tokens['refresh_token']
        current_user.spotify_token_expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=tokens['expires_in'])
        current_user.spotify_logged_in = True
        db.session.commit()
        return jsonify(tokens)
    else:
        return jsonify({'message': 'Failed to exchange authorization code'}), 400

@app.route('/login-test', methods=['GET'])
def login_test():
    client_id = 'b5d98381070641b38c70deafcae79169'
    redirect_uri = 'http://localhost:3000/callback'
    state = generate_random_string(16)
    scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state streaming'

    query_params = {
        'response_type': 'code',
        'client_id': client_id,
        'scope': scope,
        'redirect_uri': redirect_uri,
        'state': state
    }

    auth_url = 'https://accounts.spotify.com/authorize?' + urllib.parse.urlencode(query_params)
    return redirect(auth_url)

@app.route('/callback', methods=['GET'])
def callback():
    code = request.args.get('code')
    state = request.args.get('state')
    client_id = 'b5d98381070641b38c70deafcae79169'
    client_secret = 'c6818fe6cb7d4f6ca9311f92609561bc'
    redirect_uri = 'http://localhost:3000/callback'
    token_url = 'https://accounts.spotify.com/api/token'

    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret,
    })

    if response.status_code == 200:
        tokens = response.json()
        current_user.spotify_token = tokens['access_token']
        current_user.spotify_refresh_token = tokens['refresh_token']
        current_user.spotify_token_expiry = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=tokens['expires_in'])
        current_user.spotify_logged_in = True
        db.session.commit()
        return jsonify(tokens)
    else:
        return jsonify({'message': 'Failed to exchange authorization code'}), 400


# ----------------- GAMEPLAY -----------------

@app.route('/get-access-token', methods=['GET'])
def get_access_token():
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401
    return jsonify({'access_token': current_user.spotify_token})

"""
Next steps:
    1. Instantiate game object
    2. Work out the ability to start a game
    3. Have players join through a game code
    4. Make sure players scores can be updated
    5. Leaderboard functionality
    6. Route to get songs uris from a specified public playlist
"""

@app.route('/create-game', methods=['POST'])
def create_game():
    if not current_user.is_authenticated:
        return error_response('User not logged in', 401)
    
    body = json.loads(request.data)

    if 'playlist_uri' not in body:
        return error_response('Missing playlist_uri', 400)

    playlist_uri = body['playlist_uri']


    # check if this is a valid playlist uri
    headers = { 'Authorization': f'Bearer {current_user.spotify_token}' }
    response = requests.get(f'https://api.spotify.com/v1/playlists/{playlist_uri}', 
                            headers=headers)
    
    if response.status_code != 200:
        print(response.json())
        return error_response('Invalid playlist uri', 400)

    game_code = '-'.join(''.join(random.choices(string.digits, k=6)) for _ in range(1))

    game = start_game(current_user.id, playlist_uri, game_code)

    player = add_player(game.id, current_user.id, current_user.spotify_token)

    return success_response(game_to_dict(game))

@app.route('/get-game/<int:game_id>', methods=['GET'])
def get_game(game_id):
    game = Game.query.filter_by(id=game_id).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    players_in_game = game.players

    return jsonify({'game': game_to_dict(game), 
                    'players': [player.user_id for player in players_in_game]})

@app.route('/join-game', methods=['POST'])
def join_game():
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401

    body = json.loads(request.data)

    check_fields(body, ['game_code'])

    game_code = body['game_code']
    game = Game.query.filter_by(game_code=game_code).first()

    if not game:
        return jsonify({'message': 'Game not found'}), 404

    player = Player(game_id=game.id, user_id=current_user.id, 
                    spotify_token=current_user.spotify_token)
    db.session.add(player)
    db.session.commit()

    return success_response(game_to_dict(game))

@app.route('/update-scores/', methods=['POST'])
def update_player_score():
    if not current_user.is_authenticated:
        return jsonify({'message': 'User not authenticated'}), 401
    
    body = json.loads(request.data)

    check_fields(body, ['game_id', 'score'])

    game_id = body['game_id']
    score_to_add = body['score']

    player = Player.query.filter_by(game_id=game_id, user_id=current_user.id).first()
    if not player:
        return jsonify({'message': 'Player not found'}), 404
    
    player.score += score_to_add

    db.session.commit()

    return success_response({'Score updated': player.score})




# ----------------- TESTING -----------------


@app.route('/set-login-true/<int:pid>', methods=['POST'])
def set_login_true(pid):
    user = User.query.filter_by(id=pid).first()
    user.spotify_logged_in = True
    db.session.commit()
    return jsonify({'message': 'Login set to true'})

@app.route('/delete-all-games', methods=['DELETE'])
def delete_all_games():
    games = Game.query.all()
    for game in games:
        db.session.delete(game)
    db.session.commit()
    return jsonify({'message': 'All games deleted'})

if __name__ == '__main__':
    app.run(debug=True)
