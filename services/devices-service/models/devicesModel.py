from extensions import db


class DeviceType(db.Model):
    __tablename__ = "device_types"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    model = db.Column(db.String(255), nullable=False)
    location_id = db.Column(db.Integer, nullable=False)
    device_type_id = db.Column(db.Integer, db.ForeignKey('device_types.id'), nullable=True)
