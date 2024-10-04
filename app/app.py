import os
from flask import Flask
from dotenv import load_dotenv
from routes import main


load_dotenv('.env')

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    app.register_blueprint(main)

    return app


app = create_app()
