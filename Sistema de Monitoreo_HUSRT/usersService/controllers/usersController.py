from models.userModel import User
from extensions import db


def get_all_users():
    users = User.query.order_by(User.id.asc()).all()
    return [serialize_user(user) for user in users], 200


def get_user_by_document(user_document):
    user = User.query.filter_by(document=user_document).first()
    if not user:
        return {"message": "User not found"}, 404
    return serialize_user(user), 200


def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404
    return serialize_user(user), 200


def create_user(data):
    if User.query.filter_by(document=data["document"]).first():
        return {"message": "User already exists"}, 409

    new_user = User(
        name=data["name"],
        document=data["document"],
        phone=data["phone"]
    )

    db.session.add(new_user)
    db.session.commit()

    return {
        "message": "User created successfully",
        "data": serialize_user(new_user)
    }, 201


def update_user(user_id, data):
    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404

    existing_user = User.query.filter(
        User.id != user_id,
        User.document == data["document"]
    ).first()

    if existing_user:
        return {"message": "User already exists"}, 409

    user.name = data["name"]
    user.document = data["document"]
    user.phone = data["phone"]

    db.session.commit()

    return {
        "message": "User updated successfully",
        "data": serialize_user(user)
    }, 200


def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return {"message": "User not found"}, 404

    db.session.delete(user)
    db.session.commit()

    return {"message": "User deleted successfully"}, 200


def serialize_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "document": user.document,
        "phone": user.phone
    }
