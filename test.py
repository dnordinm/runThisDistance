from equations import *

start_lat, start_lon = 51.5074, -0.1278
end_lat, end_lon = 51.5155, -0.1420
D = 3 #target distance in km

T = haversine(start_lat, start_lon, end_lat, end_lon)

h = math.sqrt((D/2)**2 - (T/2)**2)

mid_lat, mid_lon = midpoint(start_lat, start_lon, end_lat, end_lon)
b = bearing(start_lat, start_lon, end_lat, end_lon)
perp = perpendicular(b)
waypoint_lat, waypoint_lon = new_waypoint(mid_lat, mid_lon, h, perp)

print(waypoint_lat, waypoint_lon)