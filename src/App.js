import { useState, useCallback, useEffect, useRef } from 'react';

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

  if (content === 'menu') {
    return <ContentMenu setContent={setContent} />
  } else if (content === 'create') {
    return <ContentCreate setContent={setContent} setRoomId={setRoomId} setRoomCode={setRoomCode} setPlayerId={setPlayerId} />
  } else if (content === 'join') {
    return <ContentJoin setContent={setContent} setRoomId={setRoomId} roomCode={roomCode} setRoomCode={setRoomCode} setPlayerId={setPlayerId} />
  } else if (content === 'wait') {
    return <ContentWait setContent={setContent} roomId={roomId} roomCode={roomCode} playerId={playerId} />
  } else if (content === 'game') {
    return <ContentGame setContent={setContent} roomId={roomId} roomCode={roomCode} playerId={playerId} />
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

export function ContentCreate({ setContent, setRoomId, setRoomCode, setPlayerId }) {
  const [ownerName, setOwnerName] = useState('');
  const [createGameButtonEnabled, setCreateGameButtonEnabled] = useState(true);

  //TODO: Reload Name and RoomCode from cache?

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

      console.log(response);

      if (!response.ok || response.status !== 201) {
        console.error("Invalid status " + response.status);

        alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

        setCreateGameButtonEnabled(true);
      } else {
        const jsonResponse = await response.json();

        console.log(jsonResponse);

        setRoomCode(jsonResponse['room_code']);
        setRoomId(jsonResponse['room_id']);
        setPlayerId(jsonResponse['player_id']);

        setContent('wait');
      }
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

export function ContentJoin({ setContent, setRoomId, roomCode, setRoomCode, setPlayerId }) {
  const [playerName, setPlayerName] = useState('');
  const [joinGameButtonEnabled, setJoinGameButtonEnabled] = useState(true);

  //TODO: Reload Name and RoomCode from cache?

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

      console.log(response);

      if (!response.ok || response.status !== 200) {
        console.error("Invalid status " + response.status);

        alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

        setJoinGameButtonEnabled(true);
      } else {
        const jsonResponse = await response.json();

        console.log(jsonResponse);

        setRoomId(jsonResponse['room_id']);
        setPlayerId(jsonResponse['player_id']);

        setContent('wait');
      }
    } catch (error) {
      console.error(error);

      //TODO: I know, duplicated code:
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

export function ContentWait({ setContent, roomId, roomCode, playerId }) {
  const [players, setPlayers] = useState([]); // {'id': 1, 'name': "Randolfo", 'is_owner': false, 'last_check': ?}
  const [ownerId, setOwnerId] = useState(-1);

  const timeoutFailuresRef = useRef(-1);
  const alreadyPolledRef = useRef(false);
  // const renderRef = useRef(0);
  // const pollRef = useRef(0);

  const waitingRoomPollFrequencyInMs = 1000;
  const waitingRoomPollFailureInMs = 10000; //10 * 1000;

  const toPlayer = (jsonPlayer) => {
    return {
      'id': jsonPlayer['player_id'],
      'name': jsonPlayer['player_name'],
      'last_check': jsonPlayer['last_check']
    };
  }

  useEffect(() => {

    async function pollWaitingRoom() {
      // pollRef.current++;
      // console.log('pollWaitingRoom ' + pollRef.current);

      const request = {
        room_id: roomId,
        player_id: playerId,
      };

      // console.log(request);

      try {
        const response = await fetch("http://game.local:8000/room-check", {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify(request)
        });

        //console.log(response);

        if (!response.ok || response.status !== 201) {
          console.error("Invalid status " + response.status);

          alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

          timeoutFailuresRef.current += waitingRoomPollFrequencyInMs;

          console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => '(timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
          if (timeoutFailuresRef.current >= waitingRoomPollFailureInMs) {
            alert('¡Ha ocurrido un error! Chequea tu conexión, o quejate con el administrador.');

            //TODO: Somehow show visual feedback of a lack of connection.
            setContent('menu');
          } else {
            setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
          }
        } else {
          const jsonResponse = await response.json();

          // console.log(jsonResponse);

          if (jsonResponse['room_status'] === 'WAITING') {
            setOwnerId(jsonResponse['owner_id']);

            const parsed_players = jsonResponse['players'].map(toPlayer);
            setPlayers(parsed_players);

            timeoutFailuresRef.current = 0;
            setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
          } else {
            setContent('game');
          }
        }
      } catch (error) {
        console.error(error);

        //TODO: I know, duplicated code:
        timeoutFailuresRef.current += waitingRoomPollFrequencyInMs;

        console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => ' + (timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
        if (timeoutFailuresRef.current >= waitingRoomPollFailureInMs) {
          alert('¡Ha ocurrido un error! Chequea tu conexión, o quejate con el administrador.');

          //TODO: Somehow show visual feedback of a lack of connection.
          setContent('menu');
        } else {
          setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
        }
      }
    }

    // Important trick to not make double API requests due to ReactJS StrictMode double render:
    // https://stackoverflow.com/a/65766356/1305745
    // https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
    if (!alreadyPolledRef.current) {
      alreadyPolledRef.current = true;
      pollWaitingRoom();
    }

  }, [setContent, roomId, playerId, setOwnerId, setPlayers]);

  // renderRef.current++;
  // console.log('render ' + renderRef.current);

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
              return <span key={player.id}>
                <PartyOwner isOwner={player.id === ownerId} />&nbsp;
                <PlayerName player_name={player.name} last_check={player.last_check} />&nbsp;
                <PlayerStatus last_check={player.last_check} />
              </span>
            })
          }
        </div>
        <GameStartWarning players={players} />
        <GameStartButton isOwner={playerId === ownerId} playerId={playerId} roomId={roomId} players={players} />
      </div>
    </div>
  );
}

export function PartyOwner({ isOwner }) {
  if (isOwner) {
    return (
      <span title="Dueño de la partida">🎩</span>
    );
  } else {
    return;
  }
}

export function PlayerName({ player_name, last_check }) {
  if (last_check < 10) {
    return player_name;
  } else {
    return (
      <em className="App-game-waitroom-form-list-lag">{player_name}</em>
    );
  }
}

export function PlayerStatus({ last_check }) {
  if (last_check < 10) {
    return (
      <span title="Usuario activo">🟢</span>
    );
  } else {
    return (
      <span title="Usuario inactivo">💤</span>
    );
  }
}

export function GameStartWarning({ players }) {
  if (players.length >= 3) {
    return;
  } else {
    return (
      <div className="App-game-waitroom-form-warning">
        <div>⚠️</div>
        <div className="App-game-waitroom-form-warning-text">
           Se necesitan almenos 3 jugadores para iniciar la partida.
        </div>
        <div>⚠️</div>
      </div>
    );
  }
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
    return players.length >= 3;
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

      if (!response.ok || response.status !== 204) {
        console.error("Invalid status " + response.status);

        alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

        setStartGameButtonEnabled(true);
      }
    } catch (error) {
      console.error(error);

      //TODO: I know, duplicated code:
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

export function ContentGame({ setContent, roomId, roomCode, playerId }) {
  const [players, setPlayers] = useState([]); // {'id': 1, 'name': "Randolfo", 'is_owner': false, 'last_check': ?}
  const [ownerId, setOwnerId] = useState(-1);
  const [leaderId, setLeaderId] = useState(-1);

  const [roundCount, setRoundCount] = useState('-1');
  const [roundTotal, setRoundTotal] = useState('-1');

  const [titleStatus, setTitleStatus] = useState('Cargando...');
  const [instruction, setInstructions] = useState('Espere por favor...');

  const [options, setOptions] = useState([]); // {'id': 1, 'text': "XXX"}

  const roomStatusRef = useRef('');
  const timeoutFailuresRef = useRef(-1);
  const alreadyPolledRef = useRef(false);
  // const renderRef = useRef(0);
  const pollRef = useRef(0);

  const waitingRoomPollFrequencyInMs = 1000;
  const waitingRoomPollFailureInMs = 10000; //10 * 1000;


  const toOption = (jsonOption) => {
    return {
      'id': jsonOption['option_id'],
      'text': jsonOption['option_text']
    };
  }

  const fetchOptions = useCallback(async () => {
    const request = {
      room_id: roomId,
      player_id: playerId,
    };

    console.log(request);

    try {
      const response = await fetch("http://game.local:8000/game-options", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(request)
      });

      console.log(response);

      if (!response.ok || response.status !== 200) {
        console.error("Invalid status " + response.status);

        alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
      } else {
        const jsonResponse = await response.json();

        console.log(jsonResponse);

        const parsed_options = jsonResponse['options'].map(toOption);
        setOptions(parsed_options);
      }
    } catch (error) {
      console.error(error);

      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
    }
  }, [setOptions]);


  const toPlayer = (jsonPlayer) => {
    return {
      'id': jsonPlayer['player_id'],
      'name': jsonPlayer['player_name'],
      'score': jsonPlayer['score'],
      'last_check': jsonPlayer['last_check']
    };
  }

  useEffect(() => {

    async function pollWaitingRoom() {
      pollRef.current++;
      console.log('pollWaitingRoom ' + pollRef.current);

      const request = {
        room_id: roomId,
        player_id: playerId,
      };

      // console.log(request);

      try {
        const response = await fetch("http://game.local:8000/room-check", {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-type": "application/json; charset=UTF-8"
          },
          body: JSON.stringify(request)
        });

        //console.log(response);

        if (!response.ok || response.status !== 201) {
          console.error("Invalid status " + response.status);

          alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

          timeoutFailuresRef.current += waitingRoomPollFrequencyInMs;

          console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => '(timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
          if (timeoutFailuresRef.current >= waitingRoomPollFailureInMs) {
            alert('¡Ha ocurrido un error! Chequea tu conexión, o quejate con el administrador.');

            //TODO: Somehow show visual feedback of a lack of connection.
            setContent('menu');
          } else {
            setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
          }
        } else {
          const jsonResponse = await response.json();

          // console.log(jsonResponse);

          // Seems we need these constants (for the switch/case below) because
          // the State object getters are not updated within Effects...
          const responseOwnerId = jsonResponse['owner_id'];
          setOwnerId(responseOwnerId);

          const responseLeaderId = jsonResponse['leader_id'];
          setLeaderId(responseLeaderId);

          const parsed_players = jsonResponse['players'].map(toPlayer);
          setPlayers(parsed_players);

          setRoundCount(jsonResponse['round_counter']);
          setRoundTotal(jsonResponse['round_total']);

          const responseRoomStatus = jsonResponse['room_status'];
          if (roomStatusRef.current !== responseRoomStatus) {
            console.log(responseRoomStatus);

            switch(responseRoomStatus) {
              case 'LEADER_OPTIONS':
                roomStatusRef.current = responseRoomStatus;
                setTitleStatus('Inspiracion');
                if (playerId === responseLeaderId) {
                  setInstructions('Obteniendo inspiracion para el lider...');

                  fetchOptions();
                } else {
                  setInstructions('Esperando a que el lider selccione una inspiracion...');
                  //TODO: Just wait: Show loading thingy
                }
                break;
              case 'LACKEY_OPTIONS':
                roomStatusRef.current = responseRoomStatus;
                setTitleStatus('Remate');
                if (playerId === responseLeaderId) {
                  setInstructions('Esperando a que los secuaces seleccionen una remate...');
                  //TODO: Just wait: Show loading thingy
                } else {
                  //TODO: Request leader chosen option
                  //TODO: Request lackey options
                  fetchOptions();
                  setInstructions('Obteniendo opciones de secuas...');
                }
                break;
              case 'LEADER_PICK':
                roomStatusRef.current = responseRoomStatus;
                setTitleStatus('Votacion');
                if (playerId === responseLeaderId) {
                  //TODO: Request lackey options
                  //TODO: Allow leader to pick a lackey option
                  setInstructions('Obteniendo remates de secuaces...');
                } else {
                  setInstructions('Esperando a que el lider selccione un remate ganador...');
                  //TODO: Just wait: Show loading thingy
                }
                break;
              case 'NOTIFY_WINNER':
                roomStatusRef.current = responseRoomStatus;
                setTitleStatus('Ganador');

                //TODO: Show winner

                if (playerId === responseOwnerId) {
                  setInstructions('Inicia una nueva ronda...');
                } else {
                  setInstructions('Espere a que el dueno inicie una nueva ronda...');
                }
                break;
              default:
                console.error('Unknown status: ' + responseRoomStatus);
            }
          }

          timeoutFailuresRef.current = 0;
          setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
        }
      } catch (error) {
        console.error(error);

        //TODO: I know, duplicated code:
        timeoutFailuresRef.current += waitingRoomPollFrequencyInMs;

        console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => ' + (timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
        if (timeoutFailuresRef.current >= waitingRoomPollFailureInMs) {
          alert('¡Ha ocurrido un error! Chequea tu conexión, o quejate con el administrador.');

          //TODO: Somehow show visual feedback of a lack of connection.
          setContent('menu');
        } else {
          setTimeout(pollWaitingRoom, waitingRoomPollFrequencyInMs);
        }
      }
    }

    // Important trick to not make double API requests due to ReactJS StrictMode double render:
    // https://stackoverflow.com/a/65766356/1305745
    // https://legacy.reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
    if (!alreadyPolledRef.current) {
      alreadyPolledRef.current = true;
      pollWaitingRoom();
    }

  }, [roomId, playerId, roomStatusRef, setOwnerId, setLeaderId, setPlayers, setTitleStatus, setInstructions]);

  // renderRef.current++;
  // console.log('render ' + renderRef.current);

  return (
    <div className="App-game-gameroom">
      <div className="App-game-gameroom-header">
        <div className="App-game-gameroom-header-element App-game-gameroom-header-element-roomcode">
          Codigo de sala:&nbsp;<span className="App-game-gameroom-header-code">{roomCode}</span>
        </div>
        <div className="App-game-gameroom-header-element">
          Status: { titleStatus }
        </div>
        <div className="App-game-gameroom-header-element App-game-gameroom-header-element-time">
          Tiempo: ∞
        </div>
      </div>
      <div className="App-game-gameroom-content">
        <div className="App-game-gameroom-content-playerslist">
          <div className="App-game-gameroom-content-playerslist-inner">
            <div className="App-game-gameroom-content-playerslist-inner-title">
              <div className="App-game-gameroom-content-playerslist-inner-title-inner">
                Ronda ({roundCount}/{roundTotal})
              </div>
            </div>
            <div className="App-game-gameroom-content-playerslist-inner-list">
              <div className="App-game-gameroom-content-playerslist-inner-list-inner">
                {
                  players.map((player) => {
                    return <span key={player.id}>
                      <PartyOwner isOwner={player.id === ownerId} />&nbsp;
                      <PlayerStatus last_check={player.last_check} />&nbsp;
                      <PlayerName player_name={player.name} last_check={player.last_check} />
                      : {player.score}
                    </span>
                  })
                }
              </div>
            </div>
          </div>
        </div>
        <div className="App-game-gameroom-content-game">
          <div>
            XXX
          </div>
          <Options roomId={roomId} playerId={playerId} options={options} setOptions={setOptions} />
        </div>
      </div>
      <div className="App-game-gameroom-footer">
        <div className="App-game-gameroom-footer-message">
          {instruction}
        </div>
      </div>
    </div>
  );
}

export function Options({ roomId, playerId, options, setOptions }) {
  const [pickOptionButtonEnabled, setPickOptionButtonEnabled] = useState(true);

  const pickOption = useCallback(async (optionId) => {
    setPickOptionButtonEnabled(false);

    const request = {
      room_id: roomId,
      player_id: playerId,
      option_id: optionId
    };

    console.log(request);

    try {
      const response = await fetch("http://game.local:8000/game-pick", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(request)
      });

      console.log(response);

      if (!response.ok || response.status !== 204) {
        console.error("Invalid status " + response.status);

        alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

        setPickOptionButtonEnabled(true);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error(error);

      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

      setPickOptionButtonEnabled(true);
    }
  }, [setPickOptionButtonEnabled]);
  if (options.length > 0) {
    return (
      <div>
        {
          options.map((option) => {
            return <div key={option.id}>
              <button className="App-game-gameroom-content-game-choice" type="button" disabled={!pickOptionButtonEnabled} onClick={_ => pickOption(option.id)}>
                {option.id} - {option.text}
              </button>
            </div>
          })
        }
      </div>
    );
  } else {
    return;
  }
}


export default App;
