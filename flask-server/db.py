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

# Initialize the database
db = SQLAlchemy()

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    spotify_token = db.Column(db.String(500), nullable=True)
    spotify_refresh_token = db.Column(db.String(500), nullable=True)

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

# Define the Game model
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answer = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, server_default=db.func.now())

    user = db.relationship('User', backref=db.backref('games', lazy=True))

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