from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

"""
Database notes:

SQL alchemy allows for working with sqlite for now but can be changed to
a different database later on.

SQL lite seems like the righr choice for now.
"""

# Initialize the database
db = SQLAlchemy()

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    spotify_token = db.Column(db.String(500), nullable=True, default=None)
    spotify_refresh_token = db.Column(db.String(500), nullable=True, default=None)
    spotify_token_expiry = db.Column(db.DateTime, nullable=True, default=None)
    spotify_logged_in = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    track_uri = db.Column(db.String(100), nullable=False)
    track_name = db.Column(db.String(100), nullable=False)
    artist_name = db.Column(db.String(100), nullable=False)

class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_code = db.Column(db.String(7), unique=True, nullable=False)
    current_track_id = db.Column(db.Integer, db.ForeignKey('track.id'), nullable=True, default=None)
    playlist_uri = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    host = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    current_track = db.relationship('Track', backref=db.backref('games', lazy=True))

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    current_guess_artist = db.Column(db.String(100), nullable=True)
    current_guess_track = db.Column(db.String(100), nullable=True)
    spotify_token = db.Column(db.String(500), nullable=True, default=None)

    game = db.relationship('Game', backref=db.backref('players', lazy=True))
    user = db.relationship('User', backref=db.backref('players', lazy=True))


# Function to initialize the database
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()

# Function to add a new user
def add_user(username, password):
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

def start_game(host, playlist_uri, game_code):
    new_game = Game(game_code=game_code, playlist_uri=playlist_uri, host=host)
    db.session.add(new_game)
    db.session.commit()
    return new_game

def add_player(game_id, user_id, spotify_token):
    new_player = Player(game_id=game_id, user_id=user_id, spotify_token=spotify_token)
    db.session.add(new_player)
    db.session.commit()
    return new_player