import {useState} from 'react'
import Token from './board/Token'
import {socket} from './socket'

type PresetMenuProps = {
  callback: (open: boolean) => void;
}

export default function PresetMenu(props: PresetMenuProps) {
  const [image, setImage] = useState<string>('');
  const [outline, setOutline] = useState<string>('#000000');
  
  return <div style={{display: 'flex', position: 'fixed', zIndex: 2, left: 0, top: 0, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#000000'}} >
    <div style={{zIndex: 10, backgroundColor: '#CCCCCC', padding: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
        <Token token={{id: -1, backgroundImage: image === '' ? undefined:image, outline: outline}}></Token>
        <p>Image URL</p>
        <input type='text' onChange={(e) => {setImage(e.target.value)}}/>
        <p>Outline Color</p>
        <input type='color' onChange={(e) => {setOutline(e.target.value)}}/>
        <button onClick={() => {
          socket.emit('add-preset', {id: -1, backgroundImage: image === '' ? undefined:image, outline: outline})
          props.callback(false);
        }}>Submit</button>
    </div>
    <div style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: '#00000077'}} onClick={() => props.callback(false)} />
  </div>
}