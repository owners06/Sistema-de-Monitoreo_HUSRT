SECRET_KEY = "super_secret_key"

class Config:    
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:0000@localhost:5432/hospital_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# class Config:    
#     SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:0000@db:5432/hospital_db'
#     SQLALCHEMY_TRACK_MODIFICATIONS = False