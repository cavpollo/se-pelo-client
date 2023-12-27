import { useState } from 'react';

import './App.css';

function App() {
  const [gameMenuVisibility, setGameMenuVisibility] = useState('');
  const [gameMenuCreateVisibility, setGameMenuCreateVisibility] = useState('none');
  const [gameMenuJoinVisibility, setGameMenuJoinVisibility] = useState('none');
  const [gameWaitRoomVisibility, setGameWaitRoomVisibility] = useState('none');
  const [gameStartButtonVisibility, setGameStartButtonVisibility] = useState('none');

  const [createGameButtonEnabled, setCreateGameButtonEnabled] = useState(true);
  const [joinGameButtonEnabled, setJoinGameButtonEnabled] = useState(true);
  const [startGameButtonEnabled, setStartGameButtonEnabled] = useState(true);

  const [ownerName, setOwnerName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]); // {'id': 1, 'name': "Randolfo"}
  
  let playerId = 0;
  let roomId = 0;

  const showmenu = () => {
    setGameMenuVisibility('');
    setGameMenuCreateVisibility('none');
    setGameMenuJoinVisibility('none');
    setGameWaitRoomVisibility('none');
  }

  const showCreateRoom = () => {
    setOwnerName('');
    setCreateGameButtonEnabled(true);

    setGameMenuVisibility('none');
    setGameMenuCreateVisibility('');
    setGameMenuJoinVisibility('none');
  }

  const showJoinRoom = () => {
    setPlayerName('');
    setRoomCode('');
    setJoinGameButtonEnabled(true);

    setGameMenuVisibility('none');
    setGameMenuCreateVisibility('none');
    setGameMenuJoinVisibility('');
  }

  const showWaitingRoom = (canStartGame) => {
    if (canStartGame) {
      setGameStartButtonVisibility('');
      setStartGameButtonEnabled(true);
    }

    setGameMenuCreateVisibility('none');
    setGameMenuJoinVisibility('none');
    setGameWaitRoomVisibility('');
  }

  const showGameRoom = () => {
    setGameWaitRoomVisibility('none');

    //TODO: show game room stuff
  }

  const toPlayer = (jsonPlayer) => {
    return {'id': jsonPlayer['player_id'], 'name': jsonPlayer['player_name'], 'is_owner': jsonPlayer['is_owner']}
  }

  const waitingRoomPollFrequencyInMs = 30000; //1000;
  const waitingRoomPollFailureInMs = 1000; //10 * 1000;
  let waitingRoomTimeoutId = 0;
  let timeoutFailures = 0;
  const pollWaitingRoom = (setPlayers) => {

    console.log('Request:');
    console.log({
      room_id: roomId,
      player_id: playerId,
    });

    fetch("http://game.local:8000/room-check", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        room_id: roomId,
        player_id: playerId,
      })
    }).then(response => {
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);

      const parsed_players = responseData['players'].map(toPlayer);
      setPlayers(parsed_players);

      timeoutFailures = 0;
      waitingRoomTimeoutId = setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs, setPlayers);
    })
    .catch(error => {
      console.error(error);

      timeoutFailures = timeoutFailures + waitingRoomPollFrequencyInMs;

      if (timeoutFailures >= waitingRoomPollFailureInMs) {
        alert('¡Ha ocurrido un error! Chequea tu conexión, o quejate con el administrador.');

        //TODO: Somehow show visual feedback of a lack of connection.
        showmenu();
      } else {
        waitingRoomTimeoutId = setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
      }
    });
  }


  const ownerNameValid = () => {
    return ownerName.trim().length > 0 && ownerName.trim().length <= 16;
  }

  const createRoom = (ownerName, setRoomCode, setPlayers) => {
    if (ownerNameValid()) {
      setCreateGameButtonEnabled(false);

      fetch("http://game.local:8000/room-create", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          owner_name: ownerName,
        })
      }).then(response => {
        return response.json();
      })
      .then(responseData => {
        console.log(responseData);

        setRoomCode(responseData['room_code']);
        playerId = responseData['player_id'];
        roomId = responseData['room_id'];

        showWaitingRoom(true);

        pollWaitingRoom(setPlayers);
      })
      .catch(error => {
        console.error(error);
        alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
        
        //TODO: remove after testing
        // showWaitingRoom(true);
        // pollWaitingRoom();
      });
    } else {
      alert('¡Nombre invalido!');
    }
  }

  const playerNameValid = () => {
    return playerName.trim().length > 0 && playerName.trim().length <= 16;
  }

  const roomCodeValid = () => {
    return roomCode.trim().length > 0 && roomCode.trim().length <= 6;
  }

  const joinRoom = (playerName, roomCode, setPlayers) => {
    if (playerNameValid()) {
      if (roomCodeValid()) {
        setStartGameButtonEnabled(false);

        fetch("http://game.local:8000/room-join", {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify({
            player_name: playerName,
            room_code: roomCode,
          })
        }).then(response => {
          return response.json();
        })
        .then(responseData => {
          console.log(responseData);

          playerId = responseData['player_id'];
          roomId = responseData['room_id'];

          showWaitingRoom(false);

          pollWaitingRoom(setPlayers);
        })
        .catch(error => {
          console.error(error);
          //TODO: re-enable
          //alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
          //TODO: dis-enable
          showWaitingRoom(false);
        });
      } else {
        alert('¡Código de partida invalido!');
      }
    } else {
      alert('¡Nombre invalido!');
    }
  }

  const playerIdValid = () => {
    return playerId > 0;
  }

  const roomIdValid = () => {
    return playerId > 0;
  }

  const playerCountValid = () => {
    return players.length > 0;
  }

  const startGame = () => {
    if (playerIdValid()) {
      if (roomIdValid()) {
        if (playerCountValid()) {
          clearTimeout(waitingRoomTimeoutId);
          setCreateGameButtonEnabled(false);

          fetch("http://game.local:8000/start-game", {
            method: "POST",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
              player_id: playerId,
              roomI_id: roomId,
            })
          }).then(response => {
            return response.json();
          })
          .then(responseData => {
            console.log(responseData);

            setGameWaitRoomVisibility('none');
          })
          .catch(error => {
            console.error(error);
            alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
          });
        } else {
          alert('¡Ha ocurrido un error! Quejate con el administrador.');
        }
      } else {
        alert('¡Ha ocurrido un error! Quejate con el administrador.');
      }
    } else {
      alert('¡Ha ocurrido un error! Quejate con el administrador.');
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        ¡Se peló!
      </header>
      <main className="App-content">
        <div className="App-game-menu" style={{display: gameMenuVisibility}}>
          <div className="App-game-menu-option">
            <button className="App-game-menu-option-button" type="button" onClick={_ => showCreateRoom()}>
              Crear una partida
            </button>
          </div>
          <div className="App-game-menu-option">
            <button className="App-game-menu-option-button" type="button" onClick={_ => showJoinRoom()}>
              Unirse a una partida
            </button>
          </div>
        </div>
        <div className="App-game-option" style={{display: gameMenuCreateVisibility}}>
          <div className="App-game-option-back">
            <button className="App-game-option-back-button" type="button" onClick={_ => showmenu()}>
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
              <button className="App-game-option-form-button" type="button" disabled={!createGameButtonEnabled || !ownerNameValid()} onClick={_ => createRoom(ownerName, setRoomCode, setPlayers)}>
                Crear la partida
              </button>
            </div>
          </div>
        </div>
        <div className="App-game-option" style={{display: gameMenuJoinVisibility}}>
          <div className="App-game-option-back">
            <button className="App-game-option-back-button" type="button" onClick={_ => showmenu()}>
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
              <button className="App-game-option-form-button" type="button" disabled={!joinGameButtonEnabled || !playerNameValid() || !roomCodeValid()} onClick={_ => joinRoom(playerName, roomCode, setPlayers)}>
                Unirse a la partida
              </button>
            </div>
          </div>
        </div>
        <div className="App-game-waitroom" style={{display: gameWaitRoomVisibility}}>
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
                players.map((player) =>
                  <span key={player.id}>{player.name}</span>
                )
              }
            </div>
            <div className="App-game-waitroom-form-actions" style={{display: gameStartButtonVisibility}}>
              <button className="App-game-waitroom-form-button" type="button" disabled={!startGameButtonEnabled || !playerIdValid() || !roomIdValid() || !playerCountValid()} onClick={_ => startGame()}>
                Iniciar la partida
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="App-footer">
        ¡Se peló!
      </footer>
    </div>
  );
}

export default App;
