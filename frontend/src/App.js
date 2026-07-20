import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'

function App() {
  const [startLat, setStartLat] = useState('')
  const [startLon, setStartLon] = useState('')
  const [endLat, setEndLat] = useState('')
  const [endLon, setEndLon] = useState('')
  const [desiredDist, setDesiredDist] = useState('')
  const [routeCoords, setRouteCoords] = useState([[51.507478, -0.127965], [51.507533, -0.127872]])
  
  function getRoute() {  
      fetch(`http://127.0.0.1:5555/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}&target_distance=${desiredDist}`)
      .then(r => r.json())
      .then(data => {
        const coords = data.routes[0].geometry.coordinates;
        const flipped = coords.map(pair => [pair[1], pair[0]]);
        setRouteCoords(flipped)
      })
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
  
  // const [message, setMessage] = useState('loading')

  // useEffect(() => {
  //   fetch('http://127.0.0.1:5555/')
  //   .then(r => r.text())
  //   .then(data => setMessage(data))
  // },[]);

  // return <div>{message}</div>
}

export default App