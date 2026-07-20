from flask import Flask, request
from flask_cors import CORS
from equations import haversine, midpoint, bearing, perpendicular, new_waypoint
import requests
import math


app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return('Homepage')

@app.route("/route")
def get_route():
    start_lat = float(request.args.get("start_lat"))
    start_lon = float(request.args.get("start_lon"))
    end_lat = float(request.args.get("end_lat"))
    end_lon = float(request.args.get("end_lon"))
    target_distance = float(request.args.get("target_distance"))

    T = haversine(start_lat, start_lon, end_lat, end_lon)
    h = math.sqrt((target_distance/2)**2 - (T/2)**2)
    mid_lat, mid_lon = midpoint(start_lat, start_lon, end_lat, end_lon)
    b = bearing(start_lat, start_lon, end_lat, end_lon)
    perp = perpendicular(b)

    max_attempts = 5
    tolerance = 0.1
    data = None

    for attempt in range(max_attempts):
        print("looop start", attempt)
        waypoint_lat, waypoint_lon = new_waypoint(mid_lat, mid_lon, h, perp)
        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{waypoint_lon},{waypoint_lat};{end_lon},{end_lat}?overview=full&geometries=geojson"
        response = requests.get(url)
        data = response.json()

        actual_distance = data["routes"][0]["distance"] / 1000
        print(actual_distance, attempt)
        if abs(actual_distance - target_distance) / target_distance <= tolerance:
            break

        ratio = target_distance / actual_distance
        h = ratio * h
    
    return data

if __name__ == "__main__":
    app.run(debug=True, port=5555)