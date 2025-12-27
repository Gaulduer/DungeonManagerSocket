import React, {useState} from 'react';
import Token from './Token.js';
import {type Token as TokenType} from '../types/types.js';
import {socket} from '../socket.js';

type GridSquareProps = {
  size: number;
  row: number;
  col: number;
  tokens: TokenType[]
}

function GridSquare(props: GridSquareProps) {
  const id: string = "Square-" + props.row + '-' + props.col;
  const [hovering, setHovering] = useState<boolean>(false); // Indicates if background should be green.
  const [draggingFrom, setDraggingFrom] = useState<boolean>(false); // Indicates if background should be red.
  const [draggingTo, setDraggingTo] = useState<boolean>(false); // Indicates if background should be green.
  const [display, setDisplay] = useState<TokenType>(); // Displays token about to be placed.

  function handleMouseEnter() {
    setHovering(true);
  }

  function handleMouseLeave() {
    setHovering(false);
  }

  function handleDragStart() {
    setDraggingFrom(true);
  }

  function handleDragEnd() {
    setDraggingFrom(false);
  }


  function handleDragEnter(e: React.DragEvent) {
    console.log(e.dataTransfer.getData('token'));
    //setDisplay(token);
    if (!draggingFrom)
      setDraggingTo(true);
  }

  function handleDragExit(e: React.DragEvent) {
    e.preventDefault();
    setDisplay(undefined);
    setHovering(false);
    setDraggingTo(false);
  }

  function handleDrop(e: React.DragEvent) {
    console.log("DROPPED!");
    e.preventDefault();
    if(draggingTo) socket.emit('place', props.row, props.col, JSON.parse(e.dataTransfer.getData('token')));
    setDraggingFrom(false);
    setDraggingTo(false);
  }

  function handleClick() {
  
  }

  function handleDoubleClick() {
  
  }

  return (
   <>
    <div id={id} style={{
        position: 'relative', 
        width: props.size + "px", 
        height: props.size + "px", 
        outline: '1px dashed #CCCCCC', 
        backgroundColor: !(draggingFrom || draggingTo) ? "#00000000":draggingTo ? "#77FF77":"#FF7777",
      }}           
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(e: React.DragEvent) => e.preventDefault()}
      onDragEnter={(e: React.DragEvent) => handleDragEnter(e)}
      onDragLeave={(e: React.DragEvent) => handleDragExit(e)}
      onDrop={handleDrop}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{position: 'absolute', zIndex: '1', width: '100%', height: '100%', backgroundColor: '#00000000'}}></div>
      {props.tokens.map((token, index) => {
        return <Token key={token.id + '' + token.placement!.id} token={token} heightOffset={props.tokens.length - 1  - index} hovering={hovering} />;  
      })}
      {display === undefined ? <></>:<Token token={display}/>}
    </div>
   </>
  )
}

export default GridSquare;
