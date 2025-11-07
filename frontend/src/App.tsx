import { useState, useEffect } from 'react';
import './App.css';
import {socket} from './socket';
import Board from './board/Board';
import TokenHolder from './TokenHolder';
import PresetMenu from './PresetMenu'
import BoardMenu from './BoardMenu'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState(0);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [boardMenuOpen, setBoardMenuOpen] = useState(false);

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('users', onUsers);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('users', onUsers);
    };
  }, []);
  
  function onConnect() {
    setIsConnected(true);
  }

  function onDisconnect() {
    setIsConnected(false);
  }

  function onUsers(users: number) {
    setUsers(users);
  }

  function setPresetMenu(open: boolean) {
    setPresetMenuOpen(open);
  }

  function setBoardMenu(open: boolean) {
    setBoardMenuOpen(open);
  }
  
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <p>Connected?: { '' + isConnected }</p>
      <p>Users: { isConnected ? users:'N/A'}</p>
      <TokenHolder callback={setPresetMenu} />
      <Board callback={setBoardMenu} />
      {presetMenuOpen ? <PresetMenu callback={setPresetMenu}/>:<></>}
      {boardMenuOpen ? <BoardMenu callback={setBoardMenu}/>:<></>}
    </div>
  )
}

export default App

