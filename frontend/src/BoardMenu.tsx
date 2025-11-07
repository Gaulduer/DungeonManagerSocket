import {useState} from 'react'
//import Token from './Token'
import {socket} from './socket'

type BoardMenuProps = {
  callback: (open: boolean) => void;
}

export default function BoardMenu(props: BoardMenuProps) {
  const [width, setWidth] = useState<number>(11);
  const [height, setHeight] = useState<number>(11);
  const [image, setImage] = useState<string>('');
  const [squareSize, setSquareSize] = useState<number>(11);

  return <div style={{display: 'flex', position: 'fixed', zIndex: 2, left: 0, top: 0, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#000000'}} >
    <div style={{zIndex: 10, backgroundColor: '#CCCCCC', padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
      <p>Width</p>
      <input type='text' onChange={(e) => {setWidth(parseInt(e.target.value)); console.log(width)}}/>
      <p>Height</p>
      <input type='text' onChange={(e) => {setHeight(parseInt(e.target.value))}}/>
      <p>Background Image</p>
      <input type='text' onChange={(e) => {setImage(e.target.value)}}/>
      <p>Square Size</p>
      <input type='text' onChange={(e) => {setSquareSize(parseInt(e.target.value))}}/>
      <button onClick={() => {
        socket.emit('board-update', width, height, image, squareSize);
        console.log(width, height, image, squareSize);
        props.callback(false);
      }}>Submit</button>
    </div>
    <div style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: '#00000077'}} onClick={() => props.callback(false)} />
  </div>
}