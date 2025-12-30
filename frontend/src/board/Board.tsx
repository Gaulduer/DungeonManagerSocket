import { useState, useEffect } from 'react'
import GridSquare from './GridSquare.js';
import { Board as BoardModel } from '../models/Board.js';
import {type Placement} from '../types/types.js';
import {socket} from '../socket.js';

type BoardProps = {
  callback: (open: boolean) => void;
}

const tokenBoard: BoardModel = new BoardModel(0, 0);
const tileBoard: BoardModel = new BoardModel(0, 0);

function Board(props: BoardProps) {
  const [tokenPlacements, setTokenPlacements] = useState<Placement[][][]>(tokenBoard.placements);
  const [tilePlacements, setTilePlacements] = useState<Placement[][][]>(tileBoard.placements);
  const [image, setImage] = useState<string>('');
  const [squareSize, setSquareSize] = useState<number>(0);

  useEffect(() => {
    socket.on('log', (message: string) => console.log(message));

    socket.on('place', (placement: Placement) => {
      console.log(placement);
      if(placement.type === 'token')
        tokenBoard.place(placement);
      else if (placement.type === 'tile')
        tileBoard.place(placement);
      renderPlacements();
    });

    socket.on('remove', (placement: Placement) => {
      if (placement.type === 'token')
        tokenBoard.remove(placement);
      else (placement.type === 'tile')
        tileBoard.remove(placement);
      renderPlacements();
    });

    socket.on('board-update', (width: number, height: number, image: string, squareSize: number) => {
      updateBoard(width, height, image, squareSize);
      renderPlacements();
    });

    socket.emit('get-board', (width: number, height: number, image: string, squareSize: number, tokens: Placement[], tiles: Placement[]) => {
      console.log("GOT BOARD!");
      console.log(width, height, image, squareSize);
      console.log(tokens, tiles);
      tokenBoard.makePlacements(width, height);
      tokenBoard.placeAll(tokens);
      tileBoard.makePlacements(width, height);
      tileBoard.placeAll(tiles);
      updateBoard(width, height, image, squareSize);
    });

    return () => {
      socket.off('place');
      socket.off('move');
      socket.off('remove');
    }
  }, []);

  function updateBoard(width: number, height: number, image: string, squareSize: number) {
    console.log(width, height);
    setImage(image);
    setSquareSize(squareSize);
    renderPlacements();
  }
  
  function renderPlacements() {
    setTokenPlacements(() => tokenBoard.placements.map((row) => {
      return row.map((col) => {
        return col;
      })
    }));
    setTilePlacements(() => tileBoard.placements.map((row) => {
      return row.map((col) => {
        return col;
      })
    }));
  }

  return (
    <>
      <div id="board" style={{outline: '2px solid #CCCCCC'}}>
        <div id="inner-board"
          style={{
            maxWidth: (squareSize * 11) + 'px',
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'column',
            backgroundColor: '#777777',
            backgroundSize: '100% 100%',
            backgroundImage: (image === '' ? '':`url(${image})`)
          }} 
          onDoubleClick={() => props.callback(true)}>
          {
            tokenPlacements.map((row, rowIndex) => {
              return <div id={"Row-" + rowIndex} style={{display: 'flex', flexDirection: 'row'}}>
                {
                  row.map((col, colIndex) => {
                    return <GridSquare size={squareSize} row={rowIndex} col={colIndex} tokens={col} tiles={tilePlacements[rowIndex][colIndex]}/>
                  })
                }
              </div>
            })
          }
        </div>
      </div>
    </>
  )
}

export default Board;