from flask import Flask
from routes.authRoute import auth_bp
from extensions import db
from config import Config
from werkzeug.security import generate_password_hash


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.sort_keys = False
    db.init_app(app)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    return app


def seed_admin(app):
    """Crea el superusuario admin si no existe."""
    from models.userModel import User

    with app.app_context():
        admin = User.query.filter_by(email="admin@husrt.com").first()
        if not admin:
            admin = User(
                email="admin@husrt.com",
                username="Administrador",
                password=generate_password_hash("admin123"),
                role="admin"
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Superusuario admin creado: admin@husrt.com / admin123")
        else:
            # Asegurar que siempre tenga rol admin
            if admin.role != "admin":
                admin.role = "admin"
                db.session.commit()
            print("ℹ️  Superusuario admin ya existe.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    seed_admin(app)
    app.run(host="0.0.0.0", port=5001, debug=True)
