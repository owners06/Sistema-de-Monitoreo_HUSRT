from flask import request, jsonify
from models.locationModel import Location
from extensions import db

def get_locations():
    locations = Location.query.all()
    return jsonify([l.to_dict() for l in locations]), 200

def get_location(location_id):
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"error": "Ubicación no encontrada"}), 404
    return jsonify(location.to_dict()), 200

def create_location():
    data = request.get_json()
    name = data.get("name")
    if not name:
        return jsonify({"error": "nombre es requerido"}), 400
    location = Location(
        name=name,
        building=data.get("building"),
        floor=data.get("floor"),
        room=data.get("room"),
        description=data.get("description"),
    )
    db.session.add(location)
    db.session.commit()
    return jsonify({"message": "Ubicación creada", "location": location.to_dict()}), 201

def update_location(location_id):
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"error": "Ubicación no encontrada"}), 404
    data = request.get_json()
    location.name = data.get("name", location.name)
    location.building = data.get("building", location.building)
    location.floor = data.get("floor", location.floor)
    location.room = data.get("room", location.room)
    location.description = data.get("description", location.description)
    db.session.commit()
    return jsonify({"message": "Ubicación actualizada", "location": location.to_dict()}), 200

def delete_location(location_id):
    location = Location.query.get(location_id)
    if not location:
        return jsonify({"error": "Ubicación no encontrada"}), 404
    db.session.delete(location)
    db.session.commit()
    return jsonify({"message": "Ubicación eliminada"}), 200
