from models.userModel import User, RoleRequest
from extensions import db
from utils.jwt_handler import generate_token
from werkzeug.security import generate_password_hash, check_password_hash


def login(data):
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user:
        return {"error": "Usuario no encontrado"}, 404

    if not check_password_hash(user.password, password):
        return {"error": "Credenciales invalidas"}, 401

    token = generate_token(user)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username or user.email,
            "role": user.role or "viewer"
        }
    }, 200


def register(data):
    email = data.get("email")
    password = data.get("password")
    username = data.get("username", "")
    role_id = data.get("role_id")

    if User.query.filter_by(email=email).first():
        return {"error": "El usuario ya existe"}, 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        email=email,
        password=hashed_password,
        username=username,
        role="viewer",
        role_id=role_id
    )

    db.session.add(new_user)
    db.session.commit()

    return {"mensaje": "Usuario creado exitosamente"}, 201


# ─── ADMIN: Gestión de cuentas de autenticación ─────────────────────────────

def get_all_auth_users():
    users = User.query.order_by(User.id.asc()).all()
    return [serialize_auth_user(u) for u in users], 200


def update_auth_user_role(user_id, data):
    user = User.query.get(user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    old_role = user.role
    new_role = data.get("role")
    if new_role not in ("admin", "operator", "viewer"):
        return {"error": "Rol inválido. Debe ser: admin, operator o viewer"}, 400

    if old_role != new_role:
        # Solo registrar ajuste manual si el cambio no viene de una aprobación de solicitud
        # (Para simplificar, el admin usa este endpoint para cambios directos)
        manual_request = RoleRequest(
            user_id=user_id,
            current_role=old_role,
            requested_role=new_role,
            status="manual_adj"
        )
        db.session.add(manual_request)
        user.role = new_role
        db.session.commit()

    return {
        "mensaje": f"Rol actualizado a '{new_role}'",
        "data": serialize_auth_user(user)
    }, 200


def delete_auth_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    if user.role == "admin":
        admin_count = User.query.filter_by(role="admin").count()
        if admin_count <= 1:
            return {"error": "No puedes eliminar el último administrador"}, 400

    # Eliminar solicitudes de rol asociadas
    RoleRequest.query.filter_by(user_id=user_id).delete()

    db.session.delete(user)
    db.session.commit()

    return {"mensaje": "Usuario eliminado exitosamente"}, 200


# ─── SOLICITUDES DE CAMBIO DE ROL ───────────────────────────────────────────

def create_role_request(data, requesting_user_id):
    requested_role = data.get("requested_role")
    if requested_role not in ("operator", "admin"):
        return {"error": "Rol solicitado inválido"}, 400

    user = User.query.get(requesting_user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    if user.role == requested_role:
        return {"error": "Ya tienes ese rol asignado"}, 400

    # Verificar si ya tiene una solicitud pendiente
    existing = RoleRequest.query.filter_by(
        user_id=requesting_user_id, status="pending"
    ).first()
    if existing:
        return {"error": "Ya tienes una solicitud pendiente"}, 400

    request_obj = RoleRequest(
        user_id=requesting_user_id,
        current_role=user.role,
        requested_role=requested_role,
        status="pending"
    )
    db.session.add(request_obj)
    db.session.commit()

    return {
        "mensaje": "Solicitud enviada exitosamente",
        "data": serialize_role_request(request_obj)
    }, 201


def get_all_role_requests():
    requests = RoleRequest.query.order_by(RoleRequest.created_at.desc()).all()
    return [serialize_role_request(r) for r in requests], 200


def get_user_role_requests(user_id):
    requests = RoleRequest.query.filter_by(user_id=user_id).order_by(
        RoleRequest.created_at.desc()
    ).all()
    return [serialize_role_request(r) for r in requests], 200


def approve_role_request(request_id):
    role_req = RoleRequest.query.get(request_id)
    if not role_req:
        return {"error": "Solicitud no encontrada"}, 404

    if role_req.status != "pending":
        return {"error": "Esta solicitud ya fue procesada"}, 400

    user = User.query.get(role_req.user_id)
    if not user:
        return {"error": "Usuario no encontrado"}, 404

    user.role = role_req.requested_role
    role_req.status = "approved"
    db.session.commit()

    return {
        "mensaje": f"Solicitud aprobada. Rol cambiado a '{role_req.requested_role}'",
        "data": serialize_role_request(role_req)
    }, 200


def reject_role_request(request_id):
    role_req = RoleRequest.query.get(request_id)
    if not role_req:
        return {"error": "Solicitud no encontrada"}, 404

    if role_req.status != "pending":
        return {"error": "Esta solicitud ya fue procesada"}, 400

    role_req.status = "rejected"
    db.session.commit()

    return {
        "mensaje": "Solicitud rechazada",
        "data": serialize_role_request(role_req)
    }, 200


# ─── SERIALIZACIÓN ──────────────────────────────────────────────────────────

def serialize_auth_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username or user.email,
        "role": user.role or "viewer"
    }


def serialize_role_request(req):
    user = User.query.get(req.user_id)
    return {
        "id": req.id,
        "user_id": req.user_id,
        "user_email": user.email if user else "Eliminado",
        "user_username": (user.username or user.email) if user else "Eliminado",
        "current_role": req.current_role,
        "requested_role": req.requested_role,
        "status": req.status,
        "created_at": req.created_at.isoformat() if req.created_at else None
    }
