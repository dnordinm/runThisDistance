import "./App.css"
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap, useMapEvents, Marker } from 'react-leaflet'

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
  const [settingPoint, setSettingPoint] = useState('start')
  const [startAddress, setStartAddress] = useState('')
  const [endAddress, setEndAddress] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [unit, setUnit] = useState('km')
  const [routeData, setRouteData] = useState({left: null, right: null})
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [theme, setTheme] = useState('dark')
  const tileURL = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'; 

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
  
  
  async function getRoute() {  
      setErrorMessage('')
      const distanceInKm = unit === 'mi' ? parseFloat(desiredDist) * 1.609344 : parseFloat(desiredDist)
      try {
        const r = await fetch(`http://127.0.0.1:5555/route?start_lat=${startLat}&start_lon=${startLon}&end_lat=${endLat}&end_lon=${endLon}&target_distance=${distanceInKm}`);
        if(!r.ok) {
          throw new Error("Route request failed.");
        }
        const data = await r.json();
        setRouteData({left: data.route_left, right: data.route_right})
        setSelectedRoute(null)
      } catch (error) {
        console.log(error)
        setErrorMessage(error.message)
      }
  }


  async function geocodeStart() {
    setErrorMessage('')
    try {
      const r = await fetch(`http://127.0.0.1:5555/geocode?address=${startAddress}`);
      if(!r.ok) {
        if(r.status === 429) {
          throw new Error('Too many requests - please wait a minute and try again.');
        }
        throw new Error('Address not found');
      };
      const data = await r.json();
      setStartLat(data.lat);
      setStartLon(data.lon);
    } catch(error) {
      console.log(error)
      setErrorMessage(error.message)
    };
  };

  async function geocodeEnd() {
    setErrorMessage('')
    try {
      const r = await fetch(`http://127.0.0.1:5555/geocode?address=${endAddress}`)
      if(!r.ok) {
        if(r.status === 429) {
          throw new Error('Too many requests - please wait a minute and try again.')
        }
        throw new Error('Address not found.')
      }
      const data = await r.json();
      setEndLat(data.lat);
      setEndLon(data.lon);
    } catch(error) {
      console.log(error)
      setErrorMessage(error.message)
    };
  };

  function buildDirections(data) {
    const leg1Steps = data.routes[0].legs[0].steps;
    const leg2Steps = data.routes[0].legs[1].steps;
    const trimmedLeg1 = leg1Steps.slice(0, -1)
    const trimmedLeg2 = leg2Steps.slice(1)
    const allSteps = [...trimmedLeg1, ...trimmedLeg2];

    return allSteps.map(step => {
      const sentence = `${step.maneuver.type} ${step.maneuver.modifier || ''} onto ${step.name || 'unamed road'}`
      return sentence.charAt(0).toUpperCase() + sentence.slice(1)
    })
  }

  const leftCoords = routeData.left ? routeData.left.routes[0].geometry.coordinates.map(pair => [pair[1], pair[0]]) : [];
  const rightCoords = routeData.right ? routeData.right.routes[0].geometry.coordinates.map(pair => [pair[1], pair[0]]) : [];
  const leftDistance = routeData.left ? routeData.left.routes[0].distance / 1000 : null;
  const rightDistance = routeData.right ? routeData.right.routes[0].distance / 1000 : null;
  const selectedData = selectedRoute ? routeData[selectedRoute] : null;
  const actualDistance = selectedData ? selectedData.routes[0].distance / 1000 : null
  const directions = selectedData ? buildDirections(selectedData) : []

  return (
    <div className="app-container">
      <div className="sidebar">
        {errorMessage && <p>{errorMessage}</p>}
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="input-group">
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            <option value='km'>Kilometers</option>
            <option value='mi'>Miles</option>
          </select>
          <h3>Start</h3>
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
            value={startAddress}
            onChange={e => setStartAddress(e.target.value)}
            placeholder="Set starting address"
          />
          <button onClick={geocodeStart}>Get Start Address</button>
        </div>

        <div className="input-group">
          <h3>End</h3>
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
            value={endAddress}
            onChange={e => setEndAddress(e.target.value)}
            placeholder="Set ending address"
            />
          <button onClick={geocodeEnd}>Get End Address</button>
        </div>
        
        <div className="input-group">
          <h3>Distance</h3>
          <input
            type="text"
            value={desiredDist}
            onChange={e => setDesiredDist(e.target.value)}
            placeholder="Set desired distance"
            />
          <button onClick={getRoute}>Get Route</button>
          </div>
            {/* {actualDistance && (
              <p>
                Total Distance: {unit === 'mi' ? (actualDistance / 1.609344).toFixed(2) : actualDistance.toFixed(2)} {unit}
              </p>
            )} */}

      {( leftDistance || rightDistance ) && (
        <div className="route-options">
          <div
            className={`route-card ${selectedRoute === 'left' ? 'selected' : ''}`}
            onClick={() => setSelectedRoute('left')}
          >
            <p><strong>Route 1</strong></p>
            <p>{unit === 'mi' ? (leftDistance / 1.609344).toFixed(2) : leftDistance.toFixed(2)} {unit}</p>
          </div>
          <div
            className={`route-card ${selectedRoute === 'right' ? 'selected' : ''}`}
            onClick={() => setSelectedRoute('right')}
          >
            <p><strong>Route 2</strong></p>
            <p>{unit === 'mi' ? (rightDistance / 1.609344).toFixed(2) : rightDistance.toFixed(2)} {unit}</p>
          </div>
        </div>
      )}

      {directions.length > 0 && (
        <div className="directions">
          <h3>Directions</h3>
          <ol>
            {directions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
      </div>

      <div className="map-area">
        <MapContainer center={[40.7608, -111.8910]} zoom={17} style={{ height: '100%', width: '100%' }}>
          <TileLayer 
          url={tileURL}
          attribution="&copy; OpenStreetMap contributors"
          />
          <Polyline
            key={`left - ${selectedRoute}`} 
            positions={leftCoords} 
            color={theme === 'dark' ? '#FF3B4E' : '#E0293C'}
            weight={selectedRoute === 'left' ? 7 : 3}
            opacity={selectedRoute === 'left' ? 1 : 0.5}
            bubblingMouseEvents={false} 
            eventHandlers={{
              click: (e) => {
                setSelectedRoute('left')
            }}}
          />
          <Polyline 
            key={`right - ${selectedRoute}`}
            positions={rightCoords} 
            color={theme === 'dark' ? '#37E0C4' : '#0EA89A'}
            weight={selectedRoute === 'right' ? 7 : 3}
            opacity={selectedRoute === 'right' ? 1 : 0.5}
            bubblingMouseEvents={false} 
            eventHandlers={{
              click: (e) => {
                setSelectedRoute('right')
            }}}
            />
          <RecenterMap coords={[...leftCoords, ...rightCoords]} />
          <ClickHandler settingPoint={settingPoint} setStartLat={setStartLat} setStartLon={setStartLon} setEndLat={setEndLat} setEndLon={setEndLon} setSettingPoint={setSettingPoint} />
          {startLat && startLon && (
            <Marker position={[startLat, startLon]} />
          )}
          {endLat && endLon && (
            <Marker position={[endLat, endLon]} />
          )}
          </MapContainer>
        </div>
    </div>  
  )  
}

export default App