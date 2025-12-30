import {useState, useEffect} from 'react'
import Tile from './board/Tile'
import {type Placement} from './types/types'
import {socket} from './socket'

function TileHolder(props: {callback: (open: boolean) => void}) {
  const [presets, setPresets] = useState<Placement[]>([])

  useEffect(() => {
    socket.emit('get-presets', 'tile', (presets: Placement[]) => {
      setPresets(presets);
    });

    socket.on('preset-tile', (preset: Placement) => {
      setPresets(presets => [...presets, preset]);
      console.log("Presets: ", preset);
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
          <Tile placement={preset} />
        </div>
      })}
      <button style={{width: '100px', height: '100px', backgroundColor: '#777777'}} onClick={() => props.callback(true)}>+</button>
    </div>
  </>
}

export default TileHolder;