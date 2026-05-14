from flask import Flask
from extensions import db
from config import Config
from routes.locationRoute import locations_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    app.register_blueprint(locations_bp, url_prefix="/locations")

    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5004, debug=True)
