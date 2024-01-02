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
      const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/room-create", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
          "Content-type": "application/json; charset=UTF-8",
          "Accept": "application/json"
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
      const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/room-join", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
          "Content-type": "application/json; charset=UTF-8",
          "Accept": "application/json"
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
        const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/room-check", {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
            "Content-type": "application/json; charset=UTF-8",
            "Accept": "application/json"
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

            //console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => '(timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
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

        //console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => ' + (timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
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
        <div className="App-game-waitroom-form-players">
          <div className="App-game-waitroom-form-players-title">
            <div className="App-game-waitroom-form-players-title-inner">
              Jugadores
            </div>
          </div>
          <div className="App-game-waitroom-form-players-list">
            {
              players.map((player) => {
                return <span key={player.id}>
                  <PartyOwner isOwner={player.id === ownerId} />&nbsp;
                  <PlayerStatus last_check={player.last_check} />&nbsp;
                  <PlayerName player_name={player.name} last_check={player.last_check} />
                </span>
              })
            }
          </div>
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
      <em className="App-game-waitroom-form-players-list-lag">{player_name}</em>
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
        <div className="App-game-waitroom-form-warning-icon">⚠️</div>
        <div className="App-game-waitroom-form-warning-text">
           Se necesitan almenos 3 jugadores para iniciar la partida.
        </div>
        <div className="App-game-waitroom-form-warning-icon">⚠️</div>
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
      const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/game-start", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
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
  const [promptText, setPromptText] = useState('');
  const [finishers, setFinishers] = useState([]); // {'player_name': "XXX", 'finisher_text': "YYY", 'is_winner': false}

  const [options, setOptions] = useState([]); // {'id': 1, 'text': "XXX"}

  const roomStatusRef = useRef('');
  const timeoutFailuresRef = useRef(-1);
  const alreadyPolledRef = useRef(false);
  // const renderRef = useRef(0);
  // const pollRef = useRef(0);

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
      const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/game-options", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
          "Content-type": "application/json; charset=UTF-8",
          "Accept": "application/json"
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
      'is_finisher_ready': jsonPlayer['is_finisher_ready'],
      'is_next_round_ready': jsonPlayer['is_next_round_ready'],
      'last_check': jsonPlayer['last_check']
    };
  }

  const toFinisher = (jsonFinisher, index) => {
    return {
      'index': index,
      'player_name': jsonFinisher['player_name'],
      'finisher_text': jsonFinisher['finisher_text'],
      'is_winner': (jsonFinisher['is_winner'])
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
        const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/room-check", {
          method: "POST",
          headers: {
            "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
            "Content-type": "application/json; charset=UTF-8",
            "Accept": "application/json"
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

            //console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => ' + (timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
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

          setPromptText(jsonResponse['prompt_text'] || '');

          const parsed_finishers = (jsonResponse['finishers'] || []).map(toFinisher);
          setFinishers(parsed_finishers);

          const responseRoomStatus = jsonResponse['room_status'];
          if (roomStatusRef.current !== responseRoomStatus) {
            // console.log(responseRoomStatus);

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
              case 'ROUND_WINNER':
                setWaitingForDataSubmit(false);
                break;
              case 'GAME_WINNER':
                if (playerId === responseOwnerId) {
                  setWaitingForDataSubmit(false);
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

        //console.info(timeoutFailuresRef.current + ' >= ' + waitingRoomPollFailureInMs + ' => ' + (timeoutFailuresRef.current >= waitingRoomPollFailureInMs));
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
          <GameStatus status={roomStatus} isLeader={playerId === leaderId} isOwner={playerId === ownerId} waitingForDataSubmit={waitingForDataSubmit} />
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
                      <PartyOwner isOwner={player.id === ownerId} />
                      <PartyLeader isLeader={player.id === leaderId} />
                      <PlayerNextRoundStatus isReadyForNextRound={player.is_next_round_ready} status={roomStatus} />
                      <PlayerOptionStatus isLeader={player.id === leaderId} isFinisherReady={player.is_finisher_ready} status={roomStatus} />
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
          <Prompt promptText={promptText} finishers={finishers} />
          <Finishers finishers={finishers} />
          <Options roomId={roomId} playerId={playerId} waitingForDataSubmit={waitingForDataSubmit} setWaitingForDataSubmit={setWaitingForDataSubmit} options={options} status={roomStatus} isLeader={playerId === leaderId} />
          <Winner status={roomStatus} players={players}></Winner>
          <NextRoundButton roomId={roomId} playerId={playerId} waitingForDataSubmit={waitingForDataSubmit} setWaitingForDataSubmit={setWaitingForDataSubmit} status={roomStatus} isOwner={playerId === ownerId} isGameEnd={roundCount === roundTotal} />

        </div>
      </div>
      <div className="App-game-gameroom-footer">
        <div className="App-game-gameroom-footer-message">
          <Instruction status={roomStatus} optionsFound={options.length > 0} isLeader={playerId === leaderId} isOwner={playerId === ownerId} isGameEnd={roundCount === roundTotal} waitingForDataSubmit={waitingForDataSubmit} />
        </div>
      </div>
    </div>
  );
}

export function PartyLeader({ isLeader }) {
  if (isLeader) {
    return (
      <span title="Líder de la ronda">💎&nbsp;</span>
    );
  } else {
    return;
  }
}

export function PlayerNextRoundStatus({ isReadyForNextRound, status }) {
  switch(status) {
    case 'ROUND_WINNER':
      if (isReadyForNextRound) {
        return (
          <span title="Listo para la siguiente ronda">✔️&nbsp;</span>
        );
      } else {
        return (
          <span title="Aun no esta listo para la siguiente ronda">⏳&nbsp;</span>
        );
      }
    default:
      return;
  }
}

export function PlayerOptionStatus({ isLeader, isFinisherReady, status }) {
  if (isLeader) {
    switch(status) {
      case 'LEADER_OPTIONS':
        return (
          <span title="Seleccionando la inspiracion">⏳&nbsp;</span>
        );
      case 'LEADER_PICK':
        return (
          <span title="Seleccionando el remate ganador">⚖️&nbsp;</span>
        );
      default:
        return;
    }
  } else {
    switch(status) {
      case 'LACKEY_OPTIONS':
        if (isFinisherReady) {
          return (
            <span title="Remate listo">✔️&nbsp;</span>
          );
        } else {
          return (
            <span title="Seleccionando un remate">⏳&nbsp;</span>
          );
        }
      default:
        return;
    }
  }
}

export function GameStatus({ status, isLeader, isOwner, waitingForDataSubmit }) {
  let phase = 'Cargando';
  let active = false;
  switch(status) {
    case 'LEADER_OPTIONS':
      phase = 'Inspiración';
      if (isLeader) {
        active = true;
      }
      break;
    case 'LACKEY_OPTIONS':
      phase = 'Remate';
      if (!isLeader && !waitingForDataSubmit) {
        active = true;
      }
      break;
    case 'LEADER_PICK':
      phase = 'Votación';
      if (isLeader) {
        active = true;
      }
      break;
    case 'ROUND_WINNER':
      phase = 'Ganador';
      if (!waitingForDataSubmit) {
        active = true;
      }
      break;
    case 'GAME_WINNER':
      phase = 'Fin';
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

export function Prompt({ promptText, finishers }) {
  if (promptText && promptText.trim() !== '') {
    if (finishers && finishers.length > 0) {
      const winnerFinisher = finishers.find((finisher) => finisher.is_winner);

      const promptTextPieces = promptText.split('_');

      const uppercasedWinnerFinisher = getUppercasedFinisherText(promptTextPieces[0], winnerFinisher.finisher_text);

      return (
        <div className="App-game-gameroom-content-game-prompt">
          <div>
            ¡<span className="App-game-gameroom-content-game-prompt-winnerplayer">{winnerFinisher.player_name}</span> se peló!
          </div>
          <div>
            {promptTextPieces[0]}
            <span className="App-game-gameroom-content-game-prompt-winnerfinisher">{uppercasedWinnerFinisher}</span>
            {promptTextPieces[1]}
          </div>
        </div>
      );
    } else {
      return (
        <div className="App-game-gameroom-content-game-prompt">
          {promptText}
        </div>
      );
    }
  } else {
    return;
  }
}

function getUppercasedFinisherText(promptLeftPiece, finisherText) {
  // 'abc! _' or 'abc? _' or 'x. _' or '¡_' or '¿_'
  const firstCleanPromptTextPiece = promptLeftPiece.trim();
  if (firstCleanPromptTextPiece.length === 0 || ['!', '¡', '?', '¿', '.'].includes(firstCleanPromptTextPiece[firstCleanPromptTextPiece.length-1])) {
    return finisherText[0].toUpperCase() + finisherText.slice(1);
  } else {
    return finisherText;
  }
}

export function Finishers({ finishers }) {
  if (finishers && finishers.length > 0) {
    return (
      <div className="App-game-gameroom-content-game-finishers">
        {
          finishers.map((finisher) => {
            if (finisher.is_winner) {
              return;
            }

            const finisherClasses = 'App-game-gameroom-content-game-finishers-finisher' + (finisher.is_winner ? ' App-game-gameroom-content-game-finishers-finisher-border' : '');
            return <div key={finisher.index} className={finisherClasses}>
                <div className="App-game-gameroom-content-game-finishers-finisher-inner">
                  <div className="App-game-gameroom-content-game-finishers-finisher-inner-text">
                    {finisher.finisher_text}
                  </div>
                  <div className="App-game-gameroom-content-game-finishers-finisher-inner-player">
                    - {finisher.player_name}
                  </div>
                </div>
            </div>
          })
        }
      </div>
    );
  } else {
    return;
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
      const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/game-pick", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
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
    default:
      break;
  }

  if (options.length > 0 && showOptions) {
    const choicesClass = 'App-game-gameroom-content-game-choices' + (isLeader ? ' App-game-gameroom-content-game-choices-prompt' : ' App-game-gameroom-content-game-choices-finisher');
    return (
      <div className={choicesClass}>
        {
          options.map((option) => {
            const optionClass = 'App-game-gameroom-content-game-choices-choice-button' +
              (waitingForDataSubmit ? '-disabled ' : ' ') +
              (isLeader ? ' App-game-gameroom-content-game-choices-choice-button-prompt' : ' App-game-gameroom-content-game-choices-choice-button-finisher');
            return <div key={option.id} className="App-game-gameroom-content-game-choices-choice">
              <button className={optionClass} type="button" disabled={waitingForDataSubmit} onClick={_ => pickOption(option.id)}>
                {option.text}
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

export function Winner({ status, players }) {
  if (status === 'GAME_WINNER') {
    let highest = 0;
    let winners = [];
    for (let i = 0; i < players.length; i++) {
      if (players[i].score > highest) {
        highest = players[i].score;
        winners = [players[i].name];
      } else if (players[i].score === highest) {
        winners.push(players[i].name);
      }
    }

    let singularPlural = winners.length > 1 ? '¡Son los más pelados!' : '¡Sos lo más pelado que hay!';
    return (
      <div className="App-game-gameroom-content-game-winners">
        <div>
          ¡Felicidades&nbsp;
          {
            winners.map((winner, index) => {
              return <span>
                  { winners.length > 1 && index === winners.length - 1 ? ' y ' : '' }
                  <span className='App-game-gameroom-content-game-winners-winner'>{winner}</span>
                  { winners.length > 2 && index < winners.length - 1 ? ', ' : '' }
                </span>
            })
          }
          !
        </div>
        <div>
          { singularPlural }
        </div>
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
      const response = await fetch(process.env.REACT_APP_SERVER_BASE_URL + "/game-start", {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": process.env.REACT_APP_ACCESS_CONTROL_ALLOW_ORIGIN,
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


  switch(status) {
    case 'ROUND_WINNER':
      if (waitingForDataSubmit) {
        return;
      } else {
        return (
          <div className="App-game-gameroom-content-game-nextround">
            <button className="App-game-gameroom-content-game-nextround-button" type="button" disabled={waitingForDataSubmit} onClick={_ => nextRound()}>
              {isGameEnd ? 'Anunciar al ganador' : 'Listo para la siguiente ronda' }
            </button>
          </div>
        );
      }
    case 'GAME_WINNER':
      if (isOwner) {
        if (waitingForDataSubmit) {
          return;
        } else {
          return (
            <div className="App-game-gameroom-content-game-nextround">
              <button className="App-game-gameroom-content-game-nextround-button" type="button" disabled={waitingForDataSubmit} onClick={_ => nextRound()}>
                Iniciar una nueva partida
              </button>
            </div>
          );
        }
      } else {
        return;
      }
    default:
      break;
  }
}

export function Instruction({ status, optionsFound, isLeader, isOwner, isGameEnd, waitingForDataSubmit }) {
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
        instruction = 'Esperando a que el líder seleccione una inspiracion'
      }
      break;
    case 'LACKEY_OPTIONS':
      if (isLeader) {
        instruction = 'Esperando a que los secuaces seleccionen una remate';
      } else {
        if (optionsFound) {
          if (waitingForDataSubmit) {
            instruction = 'Esperando a que los otros secuaces envien su remate.';
          } else {
            active = true;
            // How about "completa la frase con tu mejor remate"?
            instruction = 'Selecciona un remate para que lo vea el líder.';
          }
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
        instruction = 'Esperando a que el líder seleccione un remate ganador'
      }
      break;
    case 'ROUND_WINNER':
      if (isGameEnd) {
        if (waitingForDataSubmit) {
          instruction = 'Esperando a los demas jugadores para anunciar al ganador';
        } else {
          active = true;
          instruction = 'Indica que estas listo para anunciar al ganador';
        }
      } else {
        if (waitingForDataSubmit) {
          instruction = 'Esperando a los demas jugadores para iniciar la siguiente ronda';
        } else {
          active = true;
          instruction = 'Indica que estas listo para iniciar la siguiente ronda';
        }
      }
      break;
    case 'GAME_WINNER':
      if (isOwner) {
        active = true;
        instruction = 'Inicia una nueva ronda para continuar jugando.';
      } else {
        instruction = 'Espere a que el dueño de la partida inicie una nueva partida';
      }
      break;
    default:
      break;
  }

  if (active) {
    return (
      <span className="App-game-gameroom-footer-message-active">{instruction}</span>
    );
  } else {
    return (
      <span className="App-game-gameroom-footer-message-inactive">{instruction}</span>
    );
  }
}

export default App;
