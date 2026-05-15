from flask import Blueprint, request, jsonify
from controllers.authController import (
    login, register,
    get_all_auth_users, update_auth_user_role, delete_auth_user,
    create_role_request, get_all_role_requests, get_user_role_requests,
    approve_role_request, reject_role_request
)

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()
    result, status = login(data)
    return jsonify(result), status


@auth_bp.route('/register', methods=['POST'])
def register_route():
    data = request.get_json()
    result, status = register(data)
    return jsonify(result), status


# ─── GESTIÓN DE CUENTAS (admin) ──────────────────────────────────────────────

@auth_bp.route('/users', methods=['GET'])
def get_auth_users_route():
    result, status = get_all_auth_users()
    return jsonify(result), status


@auth_bp.route('/users/<int:user_id>/role', methods=['PUT'])
def update_user_role_route(user_id):
    data = request.get_json()
    result, status = update_auth_user_role(user_id, data)
    return jsonify(result), status


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_auth_user_route(user_id):
    result, status = delete_auth_user(user_id)
    return jsonify(result), status


# ─── SOLICITUDES DE CAMBIO DE ROL ────────────────────────────────────────────

@auth_bp.route('/role-requests', methods=['POST'])
def create_role_request_route():
    data = request.get_json()
    user_id = data.get("user_id")
    result, status = create_role_request(data, user_id)
    return jsonify(result), status


@auth_bp.route('/role-requests', methods=['GET'])
def get_role_requests_route():
    result, status = get_all_role_requests()
    return jsonify(result), status


@auth_bp.route('/role-requests/user/<int:user_id>', methods=['GET'])
def get_user_role_requests_route(user_id):
    result, status = get_user_role_requests(user_id)
    return jsonify(result), status


@auth_bp.route('/role-requests/<int:request_id>/approve', methods=['PUT'])
def approve_role_request_route(request_id):
    result, status = approve_role_request(request_id)
    return jsonify(result), status


@auth_bp.route('/role-requests/<int:request_id>/reject', methods=['PUT'])
def reject_role_request_route(request_id):
    result, status = reject_role_request(request_id)
    return jsonify(result), status
