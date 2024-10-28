from flask_sqlalchemy import SQLAlchemy


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
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    spotify_token = db.Column(db.String(500), nullable=True)
    spotify_refresh_token = db.Column(db.String(500), nullable=True)

# Function to initialize the database
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()

# Function to add a new user
def add_user(email, password):
    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

# Function to get a user by email
def get_user_by_email(email):
    return User.query.filter_by(email=email).first()

# Function to update Spotify tokens for a user
def update_spotify_tokens(user, access_token, refresh_token):
    user.spotify_token = access_token
    user.spotify_refresh_token = refresh_token
    db.session.commit()