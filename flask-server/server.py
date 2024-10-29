from flask import Flask, request, redirect, url_for, session, jsonify
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
import os
from db import init_db, add_user
from db import db, User
import json

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
    return User.query.get(int(user_id))


# ------------ HELPER FUNCTIONS ------------



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
        'spotify_refresh_token': user.spotify_refresh_token
    }



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

@app.route('/user/spotify/<int:user_id>', methods=['GET'])
def get_spotify_token(user_id):
    user = User.query.filter_by(id=user_id).first()
    return success_response(user.spotify_token)




if __name__ == '__main__':
    app.run(debug=True)