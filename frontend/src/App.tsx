import { useState, useEffect } from 'react'
import './App.css'
import {socket} from './socket'
import Board from './board/Board'
import TokenHolder from './TokenHolder'
import TileHolder from './TileHolder'
import PresetTokenMenu from './PresetTokenMenu'
import PresetTileMenu from './PresetTileMenu'
import BoardMenu from './BoardMenu'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState(0);
  const [tokenMenuOpen, setTokenMenuOpen] = useState(false);
  const [tileMenuOpen, setTileMenuOpen] = useState(false);
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
  
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <p>Connected?: { '' + isConnected }</p>
      <p>Users: { isConnected ? users:'N/A'}</p>
      <TokenHolder callback={setTokenMenuOpen} />
      <TileHolder callback={setTileMenuOpen} />
      <Board callback={setBoardMenuOpen} />
      {tokenMenuOpen ? <PresetTokenMenu callback={setTokenMenuOpen}/>:<></>}
      {tileMenuOpen ? <PresetTileMenu callback={setTileMenuOpen}/>:<></>}
      {boardMenuOpen ? <BoardMenu callback={setBoardMenuOpen}/>:<></>}
    </div>
  )
}

export default App

