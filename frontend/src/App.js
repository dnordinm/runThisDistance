import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState('loading')

  useEffect(() => {
    fetch('http://127.0.0.1:5555/')
    .then(r => r.text())
    .then(data => setMessage(data))
  },[]);

  return <div>{message}</div>
}

export default App