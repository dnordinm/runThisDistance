import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline } from 'react-leaflet'

function App() {
  // hardwired coords for testing
  const routeCoords = [
    [51.507478, -0.127965],
    [51.507487, -0.127954],
    [51.507502, -0.127933],
    [51.507517, -0.127909],
    [51.507533, -0.127872]
  ];

  return (
    <MapContainer center={[51.507478, -0.127965]} zoom={17} style={{ height: '500px', width: '100%' }}>
      <TileLayer 
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
      />
      <Polyline positions={routeCoords} />
    </MapContainer>
  )
  
  
  
  // const [message, setMessage] = useState('loading')

  // useEffect(() => {
  //   fetch('http://127.0.0.1:5555/')
  //   .then(r => r.text())
  //   .then(data => setMessage(data))
  // },[]);

  // return <div>{message}</div>
}

export default App