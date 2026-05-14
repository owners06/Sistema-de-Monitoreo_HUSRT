from models.devicesModel import Device
from extensions import db


def get_all_devices():
    devices = Device.query.order_by(Device.id.asc()).all()
    return [serialize_device(device) for device in devices], 200


def get_device_by_id(device_id):
    device = Device.query.get(device_id)
    if not device:
        return {"message": "Device not found"}, 404
    return serialize_device(device), 200


def create_device(data):
    try:
        if Device.query.filter_by(name=data.get("name")).first():
            return {"message": "Device already exists"}, 409

        new_device = Device(
            name=data.get("name"),
            model=data.get("model"),
            location_id=int(data.get("location_id")) if data.get("location_id") is not None else 1,
            device_type_id=int(data.get("device_type_id")) if data.get("device_type_id") is not None else None
        )

        db.session.add(new_device)
        db.session.commit()

        return {
            "message": "Device created successfully",
            "data": serialize_device(new_device)
        }, 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"message": f"Error interno en Dispositivos: {str(e)}"}, 500


def update_device(device_id, data):
    device = Device.query.get(device_id)
    if not device:
        return {"message": "Device not found"}, 404

    existing_device = Device.query.filter(
        Device.id != device_id,
        Device.name == data["name"]
    ).first()

    if existing_device:
        return {"message": "Device already exists"}, 409

    device.name = data["name"]
    device.model = data["model"]
    device.location_id = data["location_id"]
    device.device_type_id = data.get("device_type_id", device.device_type_id)

    db.session.commit()

    return {
        "message": "Device updated successfully",
        "data": serialize_device(device)
    }, 200


def delete_device(device_id):
    device = Device.query.get(device_id)
    if not device:
        return {"message": "Device not found"}, 404

    db.session.delete(device)
    db.session.commit()

    return {"message": "Device deleted successfully"}, 200


def serialize_device(device):
    return {
        "id": device.id,
        "name": device.name,
        "model": device.model,
        "location_id": device.location_id,
        "device_type_id": device.device_type_id
    }
