import os
from sqlalchemy import Column, String, Integer, Date
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
ma = Marshmallow()
'''
Binds Flask app and SQLAlchemy service
'''

def setup_db(app):
    database_name = 'inventory_app'
    default_database_path = "postgresql://{}:{}@{}/{}".format('postgresql' , 'password', 'localhost:5432', database_name)
    database_path = os.getenv('DATABASE_URL', default_database_path)
    heroku_database_path = database_path.replace("://", "ql://", 1) #Heroku still uses postgres and not postgresql, needs to be updated manually
    app.config["SQLALCHEMY_DATABASE_URI"] = heroku_database_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.debug = 'DEBUG' in os.environ

    db.app = app
    db.init_app(app)
    ma.init_app(app)

'''
Drops DB tables, starts anew, initialize clean database if needed
'''

def db_drop_create_all():
    db.drop_all()
    db.create_all()


class Lab_Inventory(db.Model):
    __tablename__ = 'inventory'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)
    lot_number = Column(String(50))
    quantity = Column(Integer)
    order_date = Column(Date)
    expiration_date = Column(Date)
    min_amount = Column(Integer)
    max_amount = Column(Integer)
    description = Column(String(500))

    def __init__(self, name, lot_number, quantity, order_date, expiration_date, min_amount, max_amount, description):
        self.name = name
        self.lot_number = lot_number
        self.quantity = quantity
        self.order_date = order_date
        self.expiration_date = expiration_date
        self.min_amount = min_amount
        self.max_amount = max_amount
        self.description = description
    
    def details(self):
        return {
            'name': self.name,
            'lot_number': self.lot_number,
            'quantity': self.quantity,
            'order_date': self.order_date,
            'expiration_date': self.expiration_date,
            'min_amount': self.min_amount,
            'max_amount': self.max_amount,
            'description': self.description
        }
    
    def insert(self):
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()
    
    def update(self):
        db.session.commit()

class Lab_Inventory_Schema(ma.Schema):
    class Meta:
        fields = ('id', 'name', 'lot_number', 'quantity', 'order_date', 'expiration_date', 'min_amount', 'max_amount', 'description')

inventory_schema = Lab_Inventory_Schema()
lab_inventory_schema = Lab_Inventory_Schema(many=True)

