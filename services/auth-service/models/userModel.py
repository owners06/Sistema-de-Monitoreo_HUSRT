from extensions import db
from datetime import datetime


class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


class User(db.Model):
    __tablename__ = "auth_users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="viewer")
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=True)

    def __init__(self, email, password, username=None, role="viewer", role_id=None):
        self.email = email
        self.password = password
        self.username = username
        self.role = role
        self.role_id = role_id


class RoleRequest(db.Model):
    __tablename__ = "role_requests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("auth_users.id"), nullable=False)
    current_role = db.Column(db.String(20), nullable=False)
    requested_role = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="role_requests", lazy=True)

    def __init__(self, user_id, current_role, requested_role, status="pending"):
        self.user_id = user_id
        self.current_role = current_role
        self.requested_role = requested_role
        self.status = status
