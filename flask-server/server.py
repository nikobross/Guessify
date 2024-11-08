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
from dotenv import load_dotenv
from difflib import SequenceMatcher

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

load_dotenv()

client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')

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
        'spotify_logged_in': user.spotify_logged_in,
    }

def game_to_dict(game):
    return {
        'id': game.id,
        'game_code': game.game_code,
        'current_track_id': game.current_track_id,
        'timestamp': game.timestamp,
        'host': game.host,
        'gamestate': game.gamestate,
        'song_uris': game.song_uris,
        'artist_names': game.artist_names,
        'track_names': game.track_names
    }

def refresh_spotify_token(user):
    refresh_token = user.spotify_refresh_token
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

def get_songs_from_playlist(playlist_uri):
    headers = { 'Authorization': f'Bearer {current_user.spotify_token}' }
    tracks = []
    url = f'https://api.spotify.com/v1/playlists/{playlist_uri}/tracks'
    
    while url:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            return None
        
        data = response.json()
        tracks.extend(data['items'])
        url = data['next']  # Get the next URL for pagination

    track_ids = set()
    random_tracks = []
    artist_names = []
    track_names = []

    while len(random_tracks) < 10 and len(track_ids) < len(tracks):
        track = random.choice(tracks)
        if track['track']['id'] not in track_ids:
            track_ids.add(track['track']['id'])
            random_tracks.append(track['track']['uri'])
            artist_names.append(track['track']['artists'][0]['name'])
            track_names.append(track['track']['name'])
    
    return random_tracks, artist_names, track_names

def player_to_dict(game_code, player_id):
    player = Player.query.filter_by(game_id=game_code, user_id=player_id).first()
    return {
        'user_id': player.user_id,
        'score': player.score,
        'name': player.name,
        'current_guess_artist': player.current_guess_artist,
        'current_guess_track': player.current_guess_track,
        'artist_guess_time': player.artist_guess_time,
        'track_guess_time': player.track_guess_time,
    }

def check_all_guesses(game):

    players = Player.query.filter_by(game_id=game.id).all()
    correct_artist = game.artist_names.split('|')[0]
    correct_track = game.track_names.split('|')[0]

    # Remove parenthesis and everything in them
    def clean_title(title):
        return title.split('(')[0].strip()

    clean_correct_artist = clean_title(correct_artist)
    clean_correct_track = clean_title(correct_track)

    def is_close_match(a, b, threshold=0.8):
        return SequenceMatcher(None, a.lower(), b.lower()).ratio() >= threshold

    for player in players:
        clean_artist_guess = clean_title(player.current_guess_artist or "")
        clean_track_guess = clean_title(player.current_guess_track or "")

        artist_points = 0
        track_points = 0

        if is_close_match(clean_artist_guess, clean_correct_artist):
            artist_guess_time = player.artist_guess_time
            track_start_time = game.timestamp
            time_taken = (artist_guess_time - track_start_time).total_seconds()
            artist_points = max(200, 500 - int((time_taken) * 10))

        if is_close_match(clean_track_guess, clean_correct_track):
            track_guess_time = player.track_guess_time
            track_start_time = game.timestamp
            time_taken = (track_guess_time - track_start_time).total_seconds()
            track_points = max(200, 500 - int((time_taken) * 10))

        print(f'Artist guess: {clean_artist_guess}, correct answer: {clean_correct_artist}, artist points: {artist_points}')
        print(f'Track guess: {clean_track_guess}, correct answer: {clean_correct_track}, track points: {track_points}')

        total_points = artist_points + track_points
        player.score += total_points

    db.session.commit()

    return jsonify({'message': 'All guesses checked and scores updated!'}), 200

def set_all_guesses_null(game):
    players = Player.query.filter_by(game_id=game.id).all()
    for player in players:
        player.current_guess_artist = None
        player.current_guess_track = None
        player.artist_guess_time = None
        player.track_guess_time = None
    db.session.commit()

    return jsonify({'message': 'All guesses set to null'}), 200


# ----------------- ROUTES -----------------


@app.route('/user/', methods=['POST'])
def create_user():

    body = json.loads(request.data)

    check_fields(body, ['username', 'password'])
    
    username = body['username']
    password = body['password']

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return error_response('Username already exists', 400)

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

        current_user.spotify_token_expiry = current_user.spotify_token_expiry.replace(tzinfo=datetime.timezone.utc)

        if current_user.spotify_token_expiry and current_user.spotify_token_expiry \
                                                < datetime.datetime.now(datetime.timezone.utc):
            if refresh_spotify_token(current_user):
                return success_response('Spotify token refreshed')
            else:
                print('Failed to refresh Spotify token')
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
    redirect_uri = 'http://localhost:3000/callback'
    state = generate_random_string(16)
    scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state user-read-currently-playing streaming app-remote-control'

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
    if not current_user.spotify_logged_in:
        return jsonify({'message': 'User not logged in to Spotify'}), 403
    return jsonify({'access_token': current_user.spotify_token})

"""
Lots of broken stuff:
    1. not working on chrome, only on firefox atm


    4. getting refresh token seems to be broken
    5. still need to test how it works with multiple users
    6. need ability to join without audio
    7. make the spotify login look nicer
    8. podium needs new style

    8. show the time counting down

    
    11. clean up to remove old games
    12. add points on the final question
    13. add a small animation to show song is playing

"""

@app.route('/create-game', methods=['POST'])
def create_game():
    if not current_user.is_authenticated:
        return error_response('User not logged in', 401)
    
    if not current_user.spotify_logged_in:
        return error_response('User not logged in to Spotify', 403)

    body = json.loads(request.data)

    if 'playlist_uri' not in body:
        return error_response('Missing playlist_uri', 400)

    playlist_uri = body['playlist_uri']

    song_uris, artist_names, track_names = get_songs_from_playlist(playlist_uri)

    if not song_uris or len(song_uris) < 10:
        return error_response('Invalid playlist uri, make sure enough songs on playlist', 400)

    game_code = '-'.join(''.join(random.choices(string.digits[1:], k=1) + random.choices(string.digits, k=5)) for _ in range(1))

    game = start_game(current_user.id, 
                      playlist_uri, 
                      game_code, 
                      song_uris='|'.join(song_uris), 
                      artist_names='|'.join(artist_names),
                      track_names='|'.join(track_names))

    player = add_player(game.id, current_user.id, current_user.spotify_token, current_user.username)

    db.session.commit()

    return jsonify({'game': game_to_dict(game), 'user_id': current_user.id})

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

    body = json.loads(request.data)

    check_fields(body, ['game_code'])

    game_code = body['game_code']
    game = Game.query.filter_by(game_code=game_code).first()

    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    if current_user.spotify_logged_in:
        player = Player(game_id=game.id, user_id=current_user.id, 
                        spotify_token=current_user.spotify_token, name=current_user.username)
            
    else:
        player = Player(game_id=game.id, user_id=current_user.id, name=current_user.username)

    db.session.add(player)
    db.session.commit()

    return success_response({'game': game_to_dict(game), 'user_id': current_user.id})

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

@app.route('/get-players-in-game/<int:game_code>', methods=['GET'])
def get_playes_in_game(game_code):
    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    players = game.players

    players_dict = [{'user_id': player.user_id, 
                     'score': player.score, 
                     'username': player.name} for player in players]

    return jsonify({'players': players_dict})

@app.route('/change-gamestate', methods=['POST'])
def change_gamestate():
    data = request.get_json()
    game_code = data.get('game_code')
    new_state = data.get('new_state')

    if not game_code or not new_state:
        return jsonify({'error': 'Missing game_code or new_state'}), 400

    game = Game.query.filter_by(game_code=game_code).first()

    if not game:
        return jsonify({'error': 'Game not found'}), 404
    
    if new_state not in ['lobby', 'playing', 'finished', 'leaderboard']:
        return jsonify({'error': 'Invalid game state'}), 400
    
    if new_state == 'playing':
        game.timestamp = datetime.datetime.now(datetime.timezone.utc)
        db.session.commit()

    game.set_gamestate(new_state)
    return jsonify({'message': 'Game state updated successfully', 'gamestate': game.get_gamestate()}), 200

@app.route('/get-gamestate/<int:game_code>', methods=['GET'])
def get_gamestate(game_code):
    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    return jsonify({'gamestate': game.get_gamestate()}), 200

@app.route('/check_guess', methods=['POST'])
def check_guess():
    body = json.loads(request.data)

    check_fields(body, ['game_code', 'user_id', 'artist_guess', 'track_guess'])

    game_code = body['game_code']
    user_id = body['user_id']
    artist_guess = body['artist_guess']
    track_guess = body['track_guess']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404

    player = Player.query.filter_by(game_id=game.id, user_id=user_id).first()
    if not player:
        return jsonify({'message': 'Player not found'}), 404

    correct_artist = game.artist_names.split('|')[0]
    correct_track = game.track_names.split('|')[0]

    # Remove parenthesis and everything in them
    def clean_title(title):
        return title.split('(')[0].strip()

    clean_artist_guess = clean_title(artist_guess)
    clean_track_guess = clean_title(track_guess)
    clean_correct_artist = clean_title(correct_artist)
    clean_correct_track = clean_title(correct_track)

    def is_close_match(a, b, threshold=0.8):
        return SequenceMatcher(None, a.lower(), b.lower()).ratio() >= threshold
    artist_points = 0
    track_points = 0

    if is_close_match(clean_artist_guess, clean_correct_artist):
        artist_guess_time = player.artist_guess_time
        track_start_time = game.timestamp
        time_taken = (artist_guess_time - track_start_time).total_seconds()
        artist_points = max(1, 500 - int(time_taken / 10))

    if is_close_match(clean_track_guess, clean_correct_track):
        track_guess_time = player.track_guess_time
        track_start_time = game.timestamp
        time_taken = (track_guess_time - track_start_time).total_seconds()
        track_points = max(1, 500 - int(time_taken / 10))

    total_points = artist_points + track_points
    player.score += total_points
    db.session.commit()

    return jsonify({'message': 'Points added!', 'score_increment': total_points}), 200

@app.route('/lock-in-guess-artist', methods=['POST'])
def lock_in_guess_artist():
    body = json.loads(request.data)

    check_fields(body, ['artist_guess', 'game_code', 'user_id'])

    artist_guess = body['artist_guess']
    game_code = body['game_code']
    user_id = body['user_id']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    player = Player.query.filter_by(game_id=game.id, user_id=user_id).first()
    if not player:
        return jsonify({'message': 'Player not found'}), 404
    
    player.current_guess_artist = artist_guess
    player.artist_guess_time = datetime.datetime.now(datetime.timezone.utc)
    db.session.commit()

    return jsonify({'message': 'Artist guess locked in'}), 200

@app.route('/lock-in-guess-track', methods=['POST'])
def lock_in_guess_track():
    body = json.loads(request.data)

    check_fields(body, ['track_guess', 'game_code', 'user_id'])

    track_guess = body['track_guess']
    game_code = body['game_code']
    user_id = body['user_id']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    player = Player.query.filter_by(game_id=game.id, user_id=user_id).first()
    if not player:
        return jsonify({'message': 'Player not found'}), 404
    
    player.current_guess_track = track_guess
    player.track_guess_time = datetime.datetime.now(datetime.timezone.utc)
    db.session.commit()

    return jsonify({'message': 'Track guess locked in'}), 200

@app.route('/play', methods=['POST'])
def play():
    body = json.loads(request.data)

    check_fields(body, ['game_code', 'user_id'])

    game_code = body['game_code']
    user_id = body['user_id']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    player = Player.query.filter_by(game_id=game.id, user_id=user_id).first()
    if not player:
        return jsonify({'message': 'Player not found'}), 404
    
    song_uris = game.song_uris.split('|')
    first_song_uri = song_uris[0]
    
    # check if the player is logged in to spotify
    if not player.spotify_token:
        return jsonify({'logged_in': False, 'song_uri': first_song_uri}), 200

    return jsonify({'logged_in': True, 'song_uri': first_song_uri}), 200

@app.route('/next-song', methods=['POST'])
def next_song():
    body = json.loads(request.data)

    check_fields(body, ['game_code'])
    

    game_code = body['game_code']

    game = Game.query.filter_by(game_code=game_code).first()

    if not game:
        return jsonify({'message': 'Game not found'}), 404
    
    check_all_guesses(game)
    set_all_guesses_null(game)

    song_uris = game.song_uris.split('|')
    artist_names = game.artist_names.split('|')
    track_names = game.track_names.split('|')

    song_uris.pop(0)
    artist_names.pop(0)
    track_names.pop(0)

    game.song_uris = '|'.join(song_uris)
    game.artist_names = '|'.join(artist_names)
    game.track_names = '|'.join(track_names)

    db.session.commit()

    return jsonify({'message': 'Next song loaded'}), 200

@app.route('/get-players-in-game-by-id/<int:game_id>', methods=['GET'])
def get_players_in_game_by_id(game_id):
    players = Player.query.filter_by(game_id=game_id).all()
    return [player_to_dict(game_id, player.user_id) for player in players]

@app.route('/check-leaderboard', methods=['POST'])
def check_leaderboard():
    body = json.loads(request.data)

    check_fields(body, ['game_code'])

    game_code = body['game_code']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404


    # Check if it has been 30 seconds since the timestamp of the game
    current_time = datetime.datetime.now(datetime.timezone.utc)
    game.timestamp = game.timestamp.replace(tzinfo=datetime.timezone.utc)
    time_elapsed = (current_time - game.timestamp).total_seconds()
    if time_elapsed >= 30:
        if len(game.song_uris.split('|')) == 1:
            return jsonify({'move_to_podium': True}), 200
        game.set_gamestate('leaderboard')
        return jsonify({'move_to_leaderboard': True}), 200

    # Check if all players have guessed
    players = Player.query.filter_by(game_id=game.id).all()
    all_guessed = all(player.current_guess_artist and player.current_guess_track for player in players)
    
    if all_guessed:
        if len(game.song_uris.split('|')) == 1:
            return jsonify({'move_to_podium': True}), 200
        game.set_gamestate('leaderboard')
        return jsonify({'move_to_leaderboard': True}), 200

    return jsonify({'move_to_leaderboard': False, 'move_to_podium': False}), 200

@app.route('/get-current-song-number', methods=['POST'])
def get_current_song_number():
    body = json.loads(request.data)

    check_fields(body, ['game_code'])

    game_code = body['game_code']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404

    total_songs = 10
    current_song_number = total_songs - len(game.song_uris.split('|')) + 1

    return jsonify({'current_song_number': current_song_number, 'total_songs': total_songs}), 200

@app.route('/get-current-song-uri', methods=['POST'])
def get_current_song_uri():
    body = json.loads(request.data)

    check_fields(body, ['game_code'])

    game_code = body['game_code']

    game = Game.query.filter_by(game_code=game_code).first()
    if not game:
        return jsonify({'message': 'Game not found'}), 404

    song_uris = game.song_uris.split('|')
    current_song_uri = song_uris[0]

    return jsonify({'song_uri': current_song_uri}), 200
    
"""
Remeber to add a buffer to the play song page, maybe a 3 2 1 countdown before the song starts playing
"""
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
