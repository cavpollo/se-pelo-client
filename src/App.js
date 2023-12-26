import { useState } from 'react';

import './App.css';

function App() {
  const [playerName, setPlayerName] = useState('');

  const createRoom = (playerName) => {
    if (playerName.trim().length > 0 && playerName.trim().length <= 16) {
      fetch("http://game.local:8000/room-create", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          name: playerName,
        })
      }).then(response => {
        return response.json();
      })
      .then(responseData => {
        console.log(responseData);
      })
      .catch(error => {
        console.error(error);
      });
    } else {
      alert('Invalid name length');
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <label>
          Your name:&nbsp;
          <input value={playerName} maxLength="16" onChange={e => setPlayerName(e.target.value)}  />
        </label>
        <button type="button" onClick={e => createRoom(playerName)}>
          Create Room
        </button>
      </header>
    </div>
  );
}

export default App;
