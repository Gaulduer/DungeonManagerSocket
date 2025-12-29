import React, {useState} from 'react';
import Token from './Token.js';
import Tile from './Tile.js';
import {type Placement} from '../types/types.js';
import {socket} from '../socket.js';

type GridSquareProps = {
  size: number;
  row: number;
  col: number;
  tokens: Placement[];
  tiles: Placement[];
}

function GridSquare(props: GridSquareProps) {
  const id: string = "Square-" + props.row + '-' + props.col;
  const [hovering, setHovering] = useState<boolean>(false); // Indicates if background should be green.
  const [draggingFrom, setDraggingFrom] = useState<boolean>(false); // Indicates if background should be red.
  const [draggingTo, setDraggingTo] = useState<boolean>(false); // Indicates if background should be green.
  
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
    console.log(e.dataTransfer.getData('placement'));
    //setDisplay(token);
    if (!draggingFrom)
      setDraggingTo(true);
  }

  function handleDragExit(e: React.DragEvent) {
    e.preventDefault();
    setHovering(false);
    setDraggingTo(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();

    console.log(JSON.parse(e.dataTransfer.getData('placement')));
    if(draggingTo) {
      socket.emit('place', props.row, props.col, JSON.parse(e.dataTransfer.getData('placement')));
    }

    setDraggingFrom(false);
    setDraggingTo(false);
  }

  function handleClick() {
    console.log("ITEMS\n", props.tokens, props.tiles);
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
      {props.tiles.map((placement) => {
        const contentID = JSON.parse(placement.content).id;
        return <Tile key={placement.id + '-' + contentID} placement={placement} hovering={hovering} />;  
      })}
      {props.tokens.map((placement, index) => {
        const contentID = JSON.parse(placement.content).id;
        return <Token key={placement.id + '-' + contentID} placement={placement} heightOffset={props.tokens.length - 1  - index} hovering={hovering} />;  
      })}
    </div>
   </>
  )
}

export default GridSquare;
