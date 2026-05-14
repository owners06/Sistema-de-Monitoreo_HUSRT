from flask import Blueprint
from controllers.locationController import (
    get_locations, get_location, create_location, update_location, delete_location
)

locations_bp = Blueprint("locations", __name__)

locations_bp.route("/", methods=["GET"])(get_locations)
locations_bp.route("/<int:location_id>", methods=["GET"])(get_location)
locations_bp.route("/", methods=["POST"])(create_location)
locations_bp.route("/<int:location_id>", methods=["PUT"])(update_location)
locations_bp.route("/<int:location_id>", methods=["DELETE"])(delete_location)
