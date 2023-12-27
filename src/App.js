import { useState, useCallback, useRef } from 'react';

import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        ¡Se peló!
      </header>
      <main className="App-content">
        <ContentResource />
      </main>
      <footer className="App-footer">
        ¡Se peló!
      </footer>
    </div>
  );
}


export function ContentResource() {
  const [content, setContent] = useState('menu');
  const [roomId, setRoomId] = useState(-1);
  const [roomCode, setRoomCode] = useState('');
  const [playerId, setPlayerId] = useState(-1);
  const [isOwner, setOwner] = useState(false);

  // "players" go outside because Components get rendered twice, but we've made sure with the Reference that there will be a single call.
  // This way the first render doesn't lose the polling mechanism.
  const isPollingRef = useRef(false);
  const [players, setPlayers] = useState([]); // {'id': 1, 'name': "Randolfo", 'is_owner': false, 'last_check': ?}

  if (content === 'menu') {
    return <ContentMenu setContent={setContent} />
  } else if (content === 'create') {
    return <ContentCreate setContent={setContent} setRoomId={setRoomId} setRoomCode={setRoomCode} setPlayerId={setPlayerId} setOwner={setOwner} />
  } else if (content === 'join') {
    return <ContentJoin setContent={setContent} setRoomId={setRoomId} roomCode={roomCode} setRoomCode={setRoomCode} setPlayerId={setPlayerId} setOwner={setOwner} />
  } else if (content === 'wait') {
    return <ContentWait setContent={setContent} isPollingRef={isPollingRef} roomId={roomId} roomCode={roomCode} playerId={playerId} isOwner={isOwner} players={players} setPlayers={setPlayers} />
  } else if (content === 'game') {
    return <ContentGame setContent={setContent} />
  }
}

export function ContentMenu({ setContent }) {
  return (
    <div className="App-game-menu">
      <div className="App-game-menu-option">
        <button className="App-game-menu-option-button" type="button" onClick={_ => setContent('create')}>
          Crear una partida
        </button>
      </div>
      <div className="App-game-menu-option">
        <button className="App-game-menu-option-button" type="button" onClick={_ => setContent('join')}>
          Unirse a una partida
        </button>
      </div>
    </div>
  );
}

export function ContentCreate({ setContent, setRoomId, setRoomCode, setPlayerId, setOwner }) {
  const [ownerName, setOwnerName] = useState('');
  const [createGameButtonEnabled, setCreateGameButtonEnabled] = useState(true);

  const ownerNameValid = (ownerName) => {
    return ownerName && ownerName.trim().length > 0 && ownerName.trim().length <= 16;
  }

  const createRoom = useCallback(async () => {
    setCreateGameButtonEnabled(false);

    const request = {
      owner_name: ownerName,
    };

    console.log(request);

    try {
      const response = await fetch("http://game.local:8000/room-create", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(request)
      });
      const jsonResponse = await response.json();
      
      console.log(jsonResponse);

      setRoomCode(jsonResponse['room_code']);
      setRoomId(jsonResponse['room_id']);
      setPlayerId(jsonResponse['player_id']);
      setOwner(true);

      setContent('wait');
    } catch (error) {
      console.error(error);
      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

      setCreateGameButtonEnabled(true);
    }
  }, [setCreateGameButtonEnabled, ownerName, setContent]);

  return (
    <div className="App-game-option">
      <div className="App-game-option-back">
        <button className="App-game-option-back-button" type="button" onClick={_ => setContent('menu')}>
          Volver
        </button>
      </div>
      <div className="App-game-option-form">
        <div className="App-game-option-form-title">
          Crea una partida
        </div>
        <div className="App-game-option-form-input">
          <label className="App-game-option-form-input-label">
            Tu nombre:&nbsp;
            <input value={ownerName} placeholder='Juanito' maxLength="16" onChange={e => setOwnerName(e.target.value)} />
          </label>
        </div>
        <div className="App-game-option-form-content">
          <button className="App-game-option-form-button" type="button" disabled={!createGameButtonEnabled || !ownerNameValid(ownerName)} onClick={createRoom}>
            Crear la partida
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContentJoin({ setContent, setRoomId, roomCode, setRoomCode, setPlayerId, setOwner }) {
  const [playerName, setPlayerName] = useState('');
  const [joinGameButtonEnabled, setJoinGameButtonEnabled] = useState(true);

  const playerNameValid = (playerName) => {
    return playerName && playerName.trim().length > 0 && playerName.trim().length <= 16;
  }

  const roomCodeValid = (roomCode) => {
    return roomCode && roomCode.trim().length > 0 && roomCode.trim().length <= 6;
  }

  const joinRoom = useCallback(async () => {
    setJoinGameButtonEnabled(false);

    const request = {
      player_name: playerName,
      room_code: roomCode,
    };

    console.log(request);

    try {
      const response = await fetch("http://game.local:8000/room-join", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(request)
      });
      const jsonResponse = await response.json();
      
      console.log(jsonResponse);

      setRoomId(jsonResponse['room_id']);
      setPlayerId(jsonResponse['player_id']);
      setOwner(false);

      setContent('wait');
    } catch (error) {
      console.error(error);
      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

      setJoinGameButtonEnabled(true);
    }
  }, [setJoinGameButtonEnabled, playerName, roomCode, setContent]);

  return (
    <div className="App-game-option">
      <div className="App-game-option-back">
        <button className="App-game-option-back-button" type="button" onClick={_ => setContent('menu')}>
          Volver
        </button>
      </div>
      <div className="App-game-option-form">
        <div className="App-game-option-form-title">
          Unete a una partida
        </div>
        <div className="App-game-option-form-input">
          <label className="App-game-option-form-input-label">
            Tu nombre:&nbsp;
            <input value={playerName} placeholder='Juanito' maxLength="16" onChange={e => setPlayerName(e.target.value)} />
          </label>
          <label className="App-game-option-form-input-label">
            Código de partida:&nbsp;
            <input value={roomCode} placeholder='A1B2C3' maxLength="6" onChange={e => setRoomCode(e.target.value)} />
          </label>
        </div>
        <div className="App-game-option-form-content">
          <button className="App-game-option-form-button" type="button" disabled={!joinGameButtonEnabled || !playerNameValid(playerName) || !roomCodeValid(roomCode)} onClick={joinRoom}>
            Unirse a la partida
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContentWait({ setContent, isPollingRef, roomId, roomCode, playerId, isOwner, players, setPlayers }) {  
  const toPlayer = (jsonPlayer) => {
    return {
      'id': jsonPlayer['player_id'], 
      'name': jsonPlayer['player_name'], 
      'is_owner': jsonPlayer['is_owner'], 
      'last_check': jsonPlayer['last_check']
    };
  }

  const waitingRoomPollFrequencyInMs = 1000;
  const waitingRoomPollFailureInMs = 1000; //10 * 1000;
  let timeoutFailures = 0;
  const pollWaitingRoom = useCallback(async () => {
    const request = {
      room_id: roomId,
      player_id: playerId,
    };

    //console.log(request);

    try {
      const response = await fetch("http://game.local:8000/room-check", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(request)
      });
      const jsonResponse = await response.json();
      
      console.log(jsonResponse);

      if (jsonResponse['room_status'] == 'PLAYING') {
        setContent('game');
      } else {
        const parsed_players = jsonResponse['players'].map(toPlayer);
        setPlayers(parsed_players);

        timeoutFailures = 0;
        setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
      }
    } catch (error) {
      console.error(error);

      timeoutFailures = timeoutFailures + waitingRoomPollFrequencyInMs;

      if (timeoutFailures >= waitingRoomPollFailureInMs) {
        alert('¡Ha ocurrido un error! Chequea tu conexión, o quejate con el administrador.');

        //TODO: Somehow show visual feedback of a lack of connection.
        setContent('menu');
      } else {
        setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
      }
    }
  }, [setContent, setPlayers]);


  if (!isPollingRef.current) {
    isPollingRef.current = true;
    pollWaitingRoom();
  }

  return (
    <div className="App-game-waitroom">
      <div className="App-game-waitroom-form">
        <div className="App-game-waitroom-form-title">
          Sala de espera
        </div>
        <div className="App-game-waitroom-form-subtitle">
          Codigo de sala: <span className="App-game-waitroom-form-subtitle-code">{roomCode}</span>
        </div>
        <div className="App-game-waitroom-form-subtitle">
          Jugadores
        </div>
        <div className="App-game-waitroom-form-list">
          {
            players.map((player) => {
              if (player.last_check < 10) {
                return <span key={player.id}>{ player.is_owner ? '👑' : '' } {player.name} 🟢</span>
              } else {
                return <em key={player.id} className="App-game-waitroom-form-list-lag">{ player.is_owner ? '👑' : '' } {player.name} 💤</em>
              }
            })
          }
        </div>
        <GameStartButton isOwner={isOwner} playerId={playerId} roomId={roomId} players={players} />
      </div>
    </div>
  );
}

export function GameStartButton({ isOwner, playerId, roomId, players }) {
  const [startGameButtonEnabled, setStartGameButtonEnabled] = useState(true);

  const playerIdValid = (playerId) => {
    return playerId > 0;
  }

  const roomIdValid = (roomId) => {
    return roomId > 0;
  }

  const playerCountValid = (players) => {
    return players.length > 1;
  }

  const startGame = useCallback(async () => {
    setStartGameButtonEnabled(false);

    const request = {
      room_id: roomId,
      player_id: playerId
    };

    console.log(request);

    try {
      const response = await fetch("http://game.local:8000/game-start", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(request)
      });
      
      console.log(response);
    } catch (error) {
      console.error(error);
      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

      setStartGameButtonEnabled(true);
    }
  }, [setStartGameButtonEnabled]);

  if (isOwner) {
    return (
      <div className="App-game-waitroom-form-actions">
          <button className="App-game-waitroom-form-button" type="button" disabled={!startGameButtonEnabled || !playerIdValid(playerId) || !roomIdValid(roomId) || !playerCountValid(players)} onClick={startGame}>
            Iniciar la partida
          </button>
        </div>
    );
  } else {
    return;
  }
}

export function ContentGame({ setContent }) {
  return (
    <div>
      Game goes here.
    </div>
  );
}

export default App;
