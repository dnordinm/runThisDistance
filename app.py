from flask import Flask, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return('Homepage')

@app.route("/route")
def get_route():
    start_lat = request.args.get("start_lat")
    start_lon = request.args.get("start_lon")
    end_lat = request.args.get("end_lat")
    end_lon = request.args.get("end_lon")

    url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}?overview=full&geometries=geojson"

    response = requests.get(url)
    data = response.json()

    return data

if __name__ == "__main__":
    app.run(debug=True, port=5555)