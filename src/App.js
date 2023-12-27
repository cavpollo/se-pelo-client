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
  const [playerId, setPlayerId] = useState(0);
  const [roomId, setRoomId] = useState(0);
  const [players, setPlayers] = useState([]); // {'id': 1, 'name': "Randolfo"}


  const showmenu = () => {
    setGameMenuVisibility('');
    setGameMenuCreateVisibility('none');
    setGameMenuJoinVisibility('none');
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


  const waitingRoomPollFrequencyInMs = 250;
  const waitingRoomPollFailureInMs = 10 * 1000;
  let waitingRoomTimeoutId = 0;
  let timeoutFailures = 0;
  const pollWaitingRoom = () => {
    fetch("http://game.local:8000/waiting-room", {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        roomId: roomId,
        playerId: playerId,
      })
    }).then(response => {
      return response.json();
    })
    .then(responseData => {
      console.log(responseData);

      timeoutFailures = 0;
      waitingRoomTimeoutId = setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
    })
    .catch(error => {
      console.error(error);

      //TODO: re-enable
      //timeoutFailures++;

      if (timeoutFailures >= (waitingRoomPollFailureInMs / waitingRoomPollFrequencyInMs)) {
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

  const createRoom = () => {
    if (ownerNameValid()) {
      setCreateGameButtonEnabled(false);

      fetch("http://game.local:8000/room-create", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
          name: ownerName,
        })
      }).then(response => {
        return response.json();
      })
      .then(responseData => {
        console.log(responseData);

        showWaitingRoom(true);

        pollWaitingRoom();
      })
      .catch(error => {
        console.error(error);
        //TODO: re-enable
        // alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
        //TODO: dis-enable
        showWaitingRoom(true);
        pollWaitingRoom();
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

  const joinRoom = () => {
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
            name: playerName,
            code: roomCode,
          })
        }).then(response => {
          return response.json();
        })
        .then(responseData => {
          console.log(responseData);

          showWaitingRoom(false);
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
              playerId: playerId,
              roomId: roomId,
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
              <button className="App-game-option-form-button" type="button" disabled={!createGameButtonEnabled || !ownerNameValid()} onClick={_ => createRoom()}>
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
              <button className="App-game-option-form-button" type="button" disabled={!joinGameButtonEnabled || !playerNameValid() || !roomCodeValid()} onClick={_ => joinRoom()}>
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
              Jugadores
            </div>
            <div className="App-game-waitroom-form-list">
              {
                players.map((player) =>
                  <span>{player.name}</span>
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
