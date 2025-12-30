import {useState, useEffect} from 'react'
import Token from './board/Token'
import {type Placement} from './types/types'
import {socket} from './socket'

type TokenHolderProps = {
  callback: (open: boolean) => void;
}

function TokenHolder(props: TokenHolderProps) {
  const [presets, setPresets] = useState<Placement[]>([])

  useEffect(() => {
    socket.emit('get-presets', 'token', (presets: Placement[]) => {
      setPresets(presets);
    });

    socket.on('preset-token', (preset: Placement) => {
      setPresets(presets => [...presets, preset]);
      console.log("Presets: ", presets);
    });
  }, []);

  function handleDrop(e: React.DragEvent) {
    const placement: Placement = JSON.parse(e.dataTransfer.getData('placement'));
    if(placement.id !== -1) {
      socket.emit('remove', placement);
    }
  }

  return <>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingBottom: '50px'}} 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {presets.map(preset => {
        return <div style={{width: '100px', height: '100px'}}>
          <Token placement={preset} />
        </div>
      })}
      <button style={{width: '100px', height: '100px', backgroundColor: '#777777', borderRadius: '50%'}} onClick={() => props.callback(true)}>+</button>
    </div>
  </>
}

export default TokenHolder;