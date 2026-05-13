from flask import Blueprint, request, jsonify
from controllers.usersController import *

user_bp = Blueprint('user_bp', __name__)


@user_bp.route('/users', methods=['GET'])
def get_users_route():
    result, status = get_all_users()
    return jsonify(result), status


@user_bp.route('/users/<string:user_document>', methods=['GET'])
def get_user_by_document_route(user_document):
    result, status = get_user_by_document(user_document)
    return jsonify(result), status


@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id_route(user_id):
    result, status = get_user_by_id(user_id)
    return jsonify(result), status


@user_bp.route('/users', methods=['POST'])
def create_user_route():
    data = request.get_json()

    if not data:
        return jsonify({"message": "JSON Data is required"}), 400

    result, status = create_user(data)
    return jsonify(result), status


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user_route(user_id):
    data = request.get_json()

    if not data:
        return jsonify({"message": "JSON Data is required"}), 400

    result, status = update_user(user_id, data)
    return jsonify(result), status


@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user_route(user_id):
    result, status = delete_user(user_id)
    return jsonify(result), status