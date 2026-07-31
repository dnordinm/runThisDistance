import math

def haversine(lat1, lon1, lat2, lon2):
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    R = 6371 #km
    return R * c

def midpoint(lat1, lon1, lat2, lon2):
    mid_lat = (lat1 + lat2) / 2
    mid_lon = (lon1 + lon2) / 2

    return mid_lat, mid_lon

def bearing(lat1, lon1, lat2, lon2):
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    dlon = lon2 - lon1

    theta = math.atan2(
        math.sin(dlon) * math.cos(lat2),
        math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    )
    bearing = math.degrees(theta)

    if bearing < 0:
        return bearing + 360
    else:
        return bearing

def perpendicular(bearing):
    perpendicular = bearing + 90
    if perpendicular >= 360:
        perpendicular -= 360
    
    return perpendicular

def new_waypoint(lat_start, lon_start, desired_dist, bearing):
    lat_start_radians = math.radians(lat_start)
    lon_start_radians = math.radians(lon_start)

    new_lat = math.degrees(math.asin(math.sin(lat_start_radians) * math.cos(desired_dist / 6371) + math.cos(lat_start_radians) * math.sin(desired_dist / 6371) * math.cos(math.radians(bearing))))
    
    new_lon= math.degrees(
        lon_start_radians + math.atan2(math.sin(math.radians(bearing)) * math.sin(desired_dist / 6371) * math.cos(lat_start_radians),
        math.cos(desired_dist / 6371) - math.sin(lat_start_radians) * math.sin(math.radians(new_lat))
        ))
    

    return new_lat, new_lon
    
