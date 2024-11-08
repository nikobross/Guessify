from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

"""
Database notes:

SQL alchemy allows for working with sqlite for now but can be changed to
a different database later on.

SQL lite seems like the right choice for now.
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
    gamestate = db.Column(db.String(50), nullable=False, default='waiting')
    song_uris = db.Column(db.Text, nullable=False)
    artist_names = db.Column(db.Text, nullable=False)  # Add artist_names column
    track_names = db.Column(db.Text, nullable=False)   # Add track_names column

    current_track = db.relationship('Track', backref=db.backref('games', lazy=True))

    def set_gamestate(self, state):
        self.gamestate = state
        db.session.commit()

    def get_gamestate(self):
        return self.gamestate

    def set_song_uris(self, uris):
        self.song_uris = '|'.join(uris)
        db.session.commit()

    def get_song_uris(self):
        return self.song_uris.split('|')

    def set_artist_names(self, names):
        self.artist_names = '|'.join(names)
        db.session.commit()

    def get_artist_names(self):
        return self.artist_names.split('|')

    def set_track_names(self, names):
        self.track_names = '|'.join(names)
        db.session.commit()

    def get_track_names(self):
        return self.track_names.split('|')

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    current_guess_artist = db.Column(db.String(100), nullable=True)
    current_guess_track = db.Column(db.String(100), nullable=True)

    artist_guess_time = db.Column(db.DateTime, nullable=True)
    track_guess_time = db.Column(db.DateTime, nullable=True)

    spotify_token = db.Column(db.String(500), nullable=True, default=None)
    name = db.Column(db.String(100), nullable=True, default=None)

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

def start_game(host, playlist_uri, game_code, song_uris, artist_names, track_names):
    new_game = Game(game_code=game_code, 
                    playlist_uri=playlist_uri, 
                    host=host, 
                    song_uris=song_uris, 
                    artist_names=artist_names, 
                    track_names=track_names)
    db.session.add(new_game)
    db.session.commit()
    return new_game

def add_player(game_id, user_id, spotify_token, name):
    new_player = Player(game_id=game_id, user_id=user_id, spotify_token=spotify_token, name=name)
    db.session.add(new_player)
    db.session.commit()
    return new_player