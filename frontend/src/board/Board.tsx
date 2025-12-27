import { useState, useEffect } from 'react'
import GridSquare from './GridSquare.js';
import { Board as BoardModel } from '../models/Board.js';
import {type Token, type Placement} from '../types/types.js';
import {socket} from '../socket.js';

type BoardProps = {
  callback: (open: boolean) => void;
}

const board = new BoardModel(0, 0);

function Board(props: BoardProps) {
  const [model, setModel] = useState<Token[][][]>(board.model);
  const [image, setImage] = useState<string>('');
  const [squareSize, setSquareSize] = useState<number>(0);

  useEffect(() => {
    socket.on('place', (placement: Placement, token: Token) => {
      board.place(placement, token);
      copyModel();
      console.log("Placing!");
    });

    socket.on('remove', (placement: Placement) => {
      board.remove(placement);
      copyModel();
      console.log("Removing");
    });

    socket.on('board-update', (width: number, height: number, image: string, squareSize: number) => {
      updateBoard(width, height, image, squareSize);
      copyModel();
      console.log('board-update!');
    });

    socket.emit('get-board', (width: number, height: number, image: string, squareSize: number, tokens: Token[]) => {
      updateBoard(width, height, image, squareSize);
      board.placeTokens(tokens);
      copyModel();
    })

    return () => {
      socket.off('place');
      socket.off('move');
      socket.off('remove');
    }
  }, []);

  function updateBoard(width: number, height: number, image: string, squareSize: number) {
    board.makeModel(width, height);
    setImage(image);
    setSquareSize(squareSize);
    copyModel();
  }
  
  function copyModel() {
    setModel(() => board.model.map((row) => {
      return row.map((col) => {
        return col;
      })
    }));
    //console.log(model);
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
            model.map((row, rowIndex) => {
              return <div id={"Row-" + rowIndex} style={{display: 'flex', flexDirection: 'row'}}>
                {
                  row.map((col, colIndex) => {
                    return <GridSquare size={squareSize} row={rowIndex} col={colIndex} tokens={col}/>
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