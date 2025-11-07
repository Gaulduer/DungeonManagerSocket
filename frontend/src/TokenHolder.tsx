import {useState, useEffect} from 'react'
import Token from './Token'
import {type Token as TokenType} from './types/types'
import {socket} from './socket'

type TokenHolderProps = {
  callback: (open: boolean) => void;
}

function TokenHolder(props: TokenHolderProps) {
  const [presets, setPresets] = useState<TokenType[]>([])

  useEffect(() => {
    socket.emit('get-presets', (presets: TokenType[]) => {
      setPresets(presets);
    });

    socket.on('preset', (preset: TokenType) => {
      setPresets(presets => [...presets, preset]);
      console.log("Presets: ", presets);
    });
  }, []);

  function handleDrop(e: React.DragEvent) {
    console.log(e.dataTransfer.getData('row'));
    console.log(e.dataTransfer.getData('col'));
    if(e.dataTransfer.getData('row') !== undefined && e.dataTransfer.getData('col') !== undefined) {
      socket.emit('remove', JSON.parse(e.dataTransfer.getData('token')).placement);
    }  
  }

  return <>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingBottom: '50px'}} 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {presets.map(token => {
        return <div style={{width: '100px', height: '100px'}}>
          <Token token={token} />
        </div>
      })}
      <button style={{width: '100px', height: '100px', backgroundColor: '#777777', borderRadius: '50%'}} onClick={() => props.callback(true)}>+</button>
    </div>
  </>
}

export default TokenHolder;