import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents, Marker } from 'react-leaflet'

function RecenterMap({coords}) {
  const map = useMap();

  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords);
    }
  }, [coords]);

  return null
}

function App() {
  const [startLat, setStartLat] = useState('')
  const [startLon, setStartLon] = useState('')
  const [endLat, setEndLat] = useState('')
  const [endLon, setEndLon] = useState('')
  const [desiredDist, setDesiredDist] = useState('')
  const [routeCoords, setRouteCoords] = useState([[51.507478, -0.127965]])
  const [settingPoint, setSettingPoint] = useState('start')
  
  
  function getRoute() {  
      fetch(`http://127.0.0.1:5555/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}&target_distance=${desiredDist}`)
      .then(r => r.json())
      .then(data => {
        const coords = data.routes[0].geometry.coordinates;
        const flipped = coords.map(pair => [pair[1], pair[0]]);
        setRouteCoords(flipped)
      })
  }

  function ClickHandler({ settingPoint, setStartLat, setStartLon, setEndLat, setEndLon, setSettingPoint }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        if(settingPoint === 'start') {
          setStartLat(parseFloat(lat));
          setStartLon(parseFloat(lng));
          setSettingPoint('end')
        } else {
          setEndLat(parseFloat(lat));
          setEndLon(parseFloat(lng));
          setSettingPoint('start')
        }
      }
    })
    return null
  }

  return (
    <div>
      <input
        type="text"
        value={startLat}
        onChange={e => setStartLat(e.target.value)}
        placeholder="Starting Latitude"
      />
      <input
        type="text"
        value={startLon}
        onChange={e => setStartLon(e.target.value)}
        placeholder="Starting Longitude"
      />
      <input
        type="text"
        value={endLat}
        onChange={e => setEndLat(e.target.value)}
        placeholder="Ending Latitude"
      />
      <input
        type="text"
        value={endLon}
        onChange={e => setEndLon(e.target.value)}
        placeholder="Ending Longitude"
      />
      <input
        type="text"
        value={desiredDist}
        onChange={e => setDesiredDist(e.target.value)}
        placeholder="Set desired distance"
      />

      <button onClick={getRoute}>Get Route</button>

      <MapContainer center={[51.507478, -0.127965]} zoom={17} style={{ height: '500px', width: '100%' }}>
        <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        />
        <Polyline positions={routeCoords} />
        <RecenterMap coords={routeCoords} />
        <ClickHandler settingPoint={settingPoint} setStartLat={setStartLat} setStartLon={setStartLon} setEndLat={setEndLat} setEndLon={setEndLon} setSettingPoint={setSettingPoint} />
        {startLat && startLon && (
          <Marker position={[startLat, startLon]} />
        )}
        {endLat && endLon && (
          <Marker position={[endLat, endLon]} />
        )}
      </MapContainer>
    </div>  
  )
  
  
  // const routeCoords = [
  //   [51.507478, -0.127965],
  //   [51.507487, -0.127954],
  //   [51.507502, -0.127933],
  //   [51.507517, -0.127909],
  //   [51.507533, -0.127872]
  // ];
  
  
}

// test coords:
//   Start latitude: 51.5074
//   Start longitude: -0.1278
//   End latitude: 51.5155
//   End longitude: -0.1420
//   Target distance: 4

export default App