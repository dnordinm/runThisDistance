# runThisDistance

A route planner that generates a walking/running/biking route between two points matching a target distance you choose — something no public routing API supports natively.

Enter a start point, end point, and desired distance (by typing coordinates, searching an address, or clicking directly on the map), and the app computes a route that lands close to that target, rendered live on an interactive map.

![Gif showing the app in use](./assets/Screen%20Recording%202026-08-05%20at%2020.39.11.gif)

## Why this is harder than it sounds

Routing APIs (this project uses [OSRM](http://project-osrm.org/), built on OpenStreetMap data) return the shortest path between two points. Hitting a target distance meant building that logic from scratch:

1. **Geometry** - using the insight that all points where `distance(start→P) + distance(P→end)` equals a constant form an ellipse (with start/end as foci), the app calculates how far off the direct path a waypoint needs to sit to add the desired extra distance.
2. **Spherical trigonometry** - since lat/lon coordinates sit on a sphere, not a flat plane, the app implements the Haversine formula (great-circle distance), initial bearing, and the destination-point formula by hand, in Python.
3. **Convergence loop** - straight-line geometry can only approximate what real, winding roads will actually produce. The backend requests a route through the calculated waypoint, checks the actual returned distance against the target, and iteratively scales the waypoint offset closer with each pass (up to 5 attempts) until the result lands within 10% of the target.

## Features

- Click-to-set start/end points directly on the map
- Address search (geocoding via [Nominatim](https://nominatim.org/)) as an alternative to manual coordinates
- Live map rendering with auto-recentering to fit the generated route
- Input validation and clear error messaging (impossible targets, unreachable points, rate limits, etc.)
- Rate-limited backend endpoints to stay within third-party API usage policies

## Tech stack

**Frontend:** React, react-leaflet (map rendering)
**Backend:** Python, Flask, Flask-CORS, Flask-Limiter
**External APIs:** OSRM (routing), Nominatim (geocoding)
**Core algorithms:** Haversine distance, bearing/azimuth calculation, destination-point projection. All implemented from the underlying spherical trigonometry rather than a geo library, in `backend/equations.py`

## Running it locally

**Backend:**
```bash
cd backend
pipenv install
pipenv shell
python app.py
```
Server runs on `http://127.0.0.1:5555`.

> Requires [pipenv](https://pipenv.pypa.io/) (`pip install pipenv` if you don't have it). Dependencies are locked in `Pipfile.lock`.

**Frontend:**
```bash
cd frontend
npm install
npm start
```
App runs on `http://localhost:3000`.

## Project structure

```
backend/
  app.py          # Flask routes, request handling, validation
  equations.py    # Haversine, midpoint, bearing, and waypoint-projection math
  test.py         # scratch script used to verify the geometry functions during development
  Pipfile         # dependencies
  Pipfile.lock    # locked dependency versions
frontend/
  src/App.js      # Map, form inputs, click-to-set handlers, API calls
  src/App.css     # Layout
```

## Possible future improvements

- Persist favorite/past routes (would introduce a database)
- Multiple route alternatives to choose from, rather than one final result
- Geolocation-based initial map centering
- Replace `tests.py` (a manual scratch script) with a real automated test suite (`pytest`)