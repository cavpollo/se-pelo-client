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
        if (response.status === 404) {
          //TODO: we need a better system...
          alert('No existe la partida con el código especificado. Revisa tener el código correcto.');

          setJoinGameButtonEnabled(true);
        } else {
          console.error("Invalid status " + response.status);

          alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

          setJoinGameButtonEnabled(true);
        }
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
          if (response.status === 404) {
            //TODO: Somehow show visual feedback.
            alert('La partida ya no existe. Regresaras al menu de inicio.');

            setContent('menu');
          } else {
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

  const [waitingForDataSubmit, setWaitingForDataSubmit] = useState(false);

  const [roundCount, setRoundCount] = useState('-1');
  const [roundTotal, setRoundTotal] = useState('-1');

  const [roomStatus, setRoomStatus] = useState('UNKNOWN');

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

        setWaitingForDataSubmit(false);
      }
    } catch (error) {
      console.error(error);

      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');
    }
  }, [setOptions, setWaitingForDataSubmit]);


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

          if (response.status === 404) {
            //TODO: Somehow show visual feedback.
            alert('La partida ya no existe. Regresaras al menu de inicio.');

            setContent('menu');
          } else {
            console.error("Invalid status " + response.status);

            alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

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

            roomStatusRef.current = responseRoomStatus;
            setRoomStatus(responseRoomStatus);

            switch(responseRoomStatus) {
              case 'LEADER_OPTIONS':
                if (playerId === responseLeaderId) {
                  fetchOptions();
                }
                break;
              case 'LACKEY_OPTIONS':
                if (playerId !== responseLeaderId) {
                  fetchOptions();
                }
                break;
              case 'LEADER_PICK':
                if (playerId === responseLeaderId) {
                  fetchOptions();
                }
                break;
              case 'NOTIFY_WINNER':
                setWaitingForDataSubmit(false);
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

  }, [roomId, playerId, roomStatusRef, setRoomStatus, setOwnerId, setLeaderId, setPlayers, setWaitingForDataSubmit]);

  // renderRef.current++;
  // console.log('render ' + renderRef.current);

  return (
    <div className="App-game-gameroom">
      <div className="App-game-gameroom-header">
        <div className="App-game-gameroom-header-element App-game-gameroom-header-element-roomcode">
          Codigo de sala:&nbsp;<span className="App-game-gameroom-header-code">{roomCode}</span>
        </div>
        <div className="App-game-gameroom-header-element App-game-gameroom-header-element-phase">
          <span>Fase:&nbsp;</span>
          <GameStatus status={roomStatus} isLeader={playerId === leaderId} isOwner={playerId === ownerId} />
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
          <Options roomId={roomId} playerId={playerId} waitingForDataSubmit={waitingForDataSubmit} setWaitingForDataSubmit={setWaitingForDataSubmit} options={options} status={roomStatus} isLeader={playerId === leaderId} />
          <NextRoundButton roomId={roomId} playerId={playerId} waitingForDataSubmit={waitingForDataSubmit} setWaitingForDataSubmit={setWaitingForDataSubmit} status={roomStatus} isOwner={playerId === ownerId} isGameEnd={roundCount === roundTotal} />
        </div>
      </div>
      <div className="App-game-gameroom-footer">
        <div className="App-game-gameroom-footer-message">
          <Instruction status={roomStatus} optionsFound={options.length > 0} isLeader={playerId === leaderId} isOwner={playerId === ownerId} />
        </div>
      </div>
    </div>
  );
}

export function GameStatus({ status, isLeader, isOwner }) {
  let phase = 'Cargando';
  let active = false;
  switch(status) {
    case 'LEADER_OPTIONS':
      phase = 'Inspiracion';
      if (isLeader) {
        active = true;
      }
      break;
    case 'LACKEY_OPTIONS':
      phase = 'Remate';
      if (!isLeader) {
        active = true;
      }
      break;
    case 'LEADER_PICK':
      phase = 'Votacion';
      if (isLeader) {
        active = true;
      }
      break;
    case 'NOTIFY_WINNER':
      phase = 'Ganador';
      if (isOwner) {
        active = true;
      }
      break;
    default:
      break;
  }

  if (active) {
    return (
      <span className="App-game-gameroom-header-element-phase-active">{phase}</span>
    );
  } else {
    return (
      <span className="App-game-gameroom-header-element-phase-inactive">{phase}</span>
    );
  }
}

export function Instruction({ status, optionsFound, isLeader, isOwner }) {
  let instruction = 'Espere por favor';
  let active = false;
  switch(status) {
    case 'LEADER_OPTIONS':
      if (isLeader) {
        if (optionsFound) {
          active = true;
          instruction = 'Selecciona una inspiracion para los secuaces.';
        } else {
          instruction = 'Obteniendo inspiraciones';
        }
      } else {
        instruction = 'Esperando a que el lider selccione una inspiracion'
      }
      break;
    case 'LACKEY_OPTIONS':
      if (isLeader) {
        instruction = 'Esperando a que los secuaces seleccionen una remate';
      } else {
        if (optionsFound) {
          active = true;
          instruction = 'Selecciona un remate para que lo vea el lider.';
        } else {
          instruction = 'Obteniendo remates';
        }
      }
      break;
    case 'LEADER_PICK':
      if (isLeader) {
        if (optionsFound) {
          instruction = 'Obteniendo remates';
        } else {
          active = true;
          instruction = 'Selecciona el remate ganador.';
        }
      } else {
        instruction = 'Esperando a que el lider selccione un remate ganador'
      }
      break;
    case 'NOTIFY_WINNER':
      if (isOwner) {
        active = true;
        instruction = 'Inicia una nueva ronda para continuar jugando.';
      } else {
        instruction = 'Espere a que el dueño de la partida inicie una nueva ronda';
      }
      break;
    default:
      break;
  }

  if (active) {
    return (
      <span class="App-game-gameroom-footer-message-active">{instruction}</span>
    );
  } else {
    return (
      <span class="App-game-gameroom-footer-message-inactive">{instruction}</span>
    );
  }
}

export function Options({ roomId, playerId, waitingForDataSubmit, setWaitingForDataSubmit, options, status, isLeader }) {
  const pickOption = useCallback(async (optionId) => {
    setWaitingForDataSubmit(true);

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

        setWaitingForDataSubmit(false);
      }
    } catch (error) {
      console.error(error);

      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

      setWaitingForDataSubmit(false);
    }
  }, [setWaitingForDataSubmit]);

  let showOptions = false;
  switch(status) {
    case 'LEADER_OPTIONS':
      if (isLeader) {
        showOptions = true;
      }
      break;
    case 'LACKEY_OPTIONS':
      if (!isLeader) {
        showOptions = true;
      }
      break;
    case 'LEADER_PICK':
      if (isLeader) {
        showOptions = true;
      }
      break;
    case 'NOTIFY_WINNER':
      break;
    default:
      break;
  }

  if (options.length > 0 && showOptions) {
    return (
      <div>
        {
          options.map((option) => {
            return <div key={option.id}>
              <button className="App-game-gameroom-content-game-choice" type="button" disabled={waitingForDataSubmit} onClick={_ => pickOption(option.id)}>
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

export function NextRoundButton({ roomId, playerId, waitingForDataSubmit, setWaitingForDataSubmit, status, isOwner, isGameEnd }) {
  const nextRound = useCallback(async () => {
    setWaitingForDataSubmit(true);

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

        setWaitingForDataSubmit(false);
      }
    } catch (error) {
      console.error(error);

      alert('¡Ha ocurrido un error! Chequea tu conexión y vuelve a intentarlo, o quejate con el administrador.');

      setWaitingForDataSubmit(false);
    }
  }, [setWaitingForDataSubmit]);

  if (isOwner && status === 'NOTIFY_WINNER') {
    return (
      <button className="App-game-gameroom-content-game-nextround" type="button" disabled={waitingForDataSubmit} onClick={_ => nextRound()}>
        { isGameEnd ? 'Iniciar nueva partida' : 'Iniciar siguiente ronda' }
      </button>
    );
  } else {
    return;
  }
}


export default App;
