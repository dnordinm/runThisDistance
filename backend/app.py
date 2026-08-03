from flask import Flask, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from equations import haversine, midpoint, bearing, perpendicular, new_waypoint
import requests
import math


app = Flask(__name__)
CORS(app)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits = ['50 per hour']
)

@app.route("/")
def home():
    return('Homepage')

@app.route("/route")
def get_route():
    start_lat = request.args.get("start_lat")
    start_lon = request.args.get("start_lon")
    end_lat = request.args.get("end_lat")
    end_lon = request.args.get("end_lon")
    target_distance = request.args.get("target_distance")

    if not all([start_lat, start_lon, end_lat, end_lon, target_distance]):
        return {'error': 'Fill in all parameters.'}, 400
    
    start_lat = float(start_lat)
    start_lon = float(start_lon)
    end_lat = float(end_lat)
    end_lon = float(end_lon)
    target_distance = float(target_distance)
    
    if target_distance <= 0:
        return {'error': 'Target distance must be a positive number'}, 400

    T = haversine(start_lat, start_lon, end_lat, end_lon)
    
    if target_distance < T:
        return {'error': 'Target distance must be greater than straight line distance'}, 400
    
    h = math.sqrt((target_distance/2)**2 - (T/2)**2)
    mid_lat, mid_lon = midpoint(start_lat, start_lon, end_lat, end_lon)
    b = bearing(start_lat, start_lon, end_lat, end_lon)
    perp = perpendicular(b)


    max_attempts = 8
    tolerance = 0.03
    data = None

    for attempt in range(max_attempts):
        print("looop start", attempt)
        waypoint_lat, waypoint_lon = new_waypoint(mid_lat, mid_lon, h, perp)
        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{waypoint_lon},{waypoint_lat};{end_lon},{end_lat}?overview=full&geometries=geojson&steps=true"
        response = requests.get(url)
        data = response.json()

        if data['code'] != 'Ok':
            return {'error': 'No route found between two points.'}, 400

        actual_distance = data["routes"][0]["distance"] / 1000
        print(actual_distance, attempt)
        if abs(actual_distance - target_distance) / target_distance <= tolerance:
            break

        ratio = target_distance / actual_distance
        h = ratio * h
    
    return data

@app.route('/geocode')
@limiter.limit("1 per second; 30 per minute")
def geocode():
    address = request.args.get("address")

    if not address:
        return {'error': 'Address is required'}, 400

    url = f"https://nominatim.openstreetmap.org/search?q={address}&format=json"
    headers = {"User-Agent": "https://github.com/dnordinm/runThisDistance"}

    response = requests.get(url, headers=headers)
    data = response.json()

    if not data:
        return {'error': 'Address not found'}, 400

    lat = float(data[0]["lat"])
    lon = float(data[0]["lon"])

    return {"lat": lat, "lon":lon}

if __name__ == "__main__":
    app.run(debug=True, port=5555)