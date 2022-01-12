import pickle
import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from models import setup_db, Lab_Inventory, db_drop_create_all, lab_inventory_schema, inventory_schema

#Creates and configures the application
def create_app(test_config=None):
    app = Flask(__name__, static_folder='build/', static_url_path='/')
    setup_db(app)
    CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'

    #uncomment first time running the app
    #db_drop_create_all()

    #Main Page
    @app.route('/')
    @cross_origin()
    def index():
        request_type = request.method
        if request_type == 'GET':
            return app.send_static_file('index.html')
        else:
            text = request.form['text']
            path=""
            return app.send_static_file('index.html', Href=path)

    #General Path
    @app.route('/<path:path>')
    @cross_origin()
    def static_file(path):
        return app.send_static_file(path)

    #Get all items from inventory
    @app.route('/get-inventory', methods = ['GET'])
    @cross_origin()
    def get_all_inventory():
        all_inventory_items = Lab_Inventory.query.all()
        results = lab_inventory_schema.dump(all_inventory_items)
        return jsonify(results)

    #Get a single item from inventory
    # @app.route('/<id>', methods = ['GET'])
    # def get_single_item():
    #     item = Lab_Inventory.query.get(id)
    #     return lab_inventory_schema.jsonify(item)

    #Update a single item from inventory
    # @app.route('/update/<id>', methods = ['PUT'])
    # def update_item():
    #     item = Lab_Inventory.query.get(id)

    #     name = request.json['name']
    #     lot_number = request.json['lot_number']
    #     quantity = request.json['quantity']
    #     order_date = request.json['order_date']
    #     expiration_date = request.json['expiration_date']
    #     min_amount = request.json['min_amount']
    #     max_amount = request.json['max_amount']
    #     description = request.json['description']

    #     item.name = name
    #     item.lot_number = lot_number
    #     item.quantity = quantity
    #     item.order_date = order_date
    #     item.expiration_date = expiration_date
    #     item.min_amount = min_amount
    #     item.max_amount = max_amount
    #     item.description = description

    #     Lab_Inventory.update(item);
    #     return inventory_schema.jsonify(item)

    #Add a single item from inventory
    @app.route('/add', methods = ['POST'])
    @cross_origin()
    def add_inventory_item():
        name = request.json['name']
        lot_number = request.json['lot_number']
        quantity = request.json['quantity']
        order_date = request.json['order_date']
        expiration_date = request.json['expiration_date']
        min_amount = request.json['min_amount']
        max_amount = request.json['max_amount']
        description = request.json['description']

        item = Lab_Inventory(name, lot_number, quantity, order_date, expiration_date, min_amount, max_amount, description)
        Lab_Inventory.insert(item);
        return inventory_schema.jsonify(item)

    #Delete a single item from inventory
    # @app.route('/delete/<id>', methods = ['DELETE'])
    # def delete_item(id):
    #     item = Lab_Inventory.query.get(id)
    #     Lab_Inventory.delete(item);
    #     return inventory_schema.jsonify(item)

    #Makes request to ML Model trained     
    @app.route('/predictions', methods=['GET', 'POST'])
    @cross_origin()
    def make_prediction():
        prediction_model = pickle.load(open('saved_model.pkl', 'rb'))
        periods=100
        new_prediction = prediction_model.predict(periods)
        lists = new_prediction.tolist()
        results = json.dumps(lists)
        return jsonify(results)

    return app
