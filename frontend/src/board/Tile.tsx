import {useState} from 'react'
import {type Tile as TileType, type Placement} from '../types/types.js'

function Tile(props: {
  placement: Placement
  hovering?: boolean;
}) {
  const [grabbed, setGrabbed] = useState<boolean>(false);
  const tile: TileType = JSON.parse(props.placement.content);

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('placement', JSON.stringify(props.placement));
    setGrabbed(true);
  }

  function handleDragEnd() {
    setGrabbed(false);
  }

  return (
   <>
    <div id={props.placement.id + ''} className="tile" draggable 
      style={{
        position: props.placement.id === -1 ? 'relative':'absolute',
        zIndex: props.hovering ? '2':'0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%', 
        backgroundColor: "#333333", 
        backgroundSize: '100% 100%',
        backgroundImage: tile.backgroundImage ? `url(${tile.backgroundImage})`:'',
        opacity: grabbed ? '0.5':'1.0',
        cursor: 'grab',
      }} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    ></div>
   </>
  )
}

export default Tile;
