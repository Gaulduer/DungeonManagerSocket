import {useState} from 'react'
import {type Token as TokenType, type Placement} from '../types/types.js'

function Token(props: {
  placement: Placement
  heightOffset?: number;
  hovering?: boolean;
}) {
  const [grabbed, setGrabbed] = useState<boolean>(false);
  const [context, setContext] = useState<boolean>(false);
  const token: TokenType = JSON.parse(props.placement.content);

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('placement', JSON.stringify(props.placement));
    setGrabbed(true);
  }

  function handleDragEnd() {
    setGrabbed(false);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContext(true);
  }

  function handleMouseLeave(e: React.MouseEvent) {
    e.preventDefault();
    setContext(false);
  }

  return (
   <>
    <div id={props.placement.id + ''} className="token" draggable 
      style={{
        position: props.placement.id === -1 ? 'relative':'absolute',
        zIndex: props.hovering ? '2':'0',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%', 
        backgroundColor: token.outline ? token.outline:"#333333", 
        opacity: grabbed ? '0.5':'1.0',
        borderRadius: '50%', 
        cursor: 'grab',
        transform: props.heightOffset && props.hovering ? 'translate(0,' + (-50 * props.heightOffset) + '%)':'translate(0, 0)',
        transition: 'transform 0.25s ease-in-out'
      }} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onContextMenu={handleContextMenu}
      onMouseLeave={(handleMouseLeave)}
    >
      <div id={props.placement.contentID + ''} className="innerToken" draggable style={{
        alignSelf: 'center', 
        width: '90%', 
        height: '90%', 
        backgroundColor: "#333333", 
        borderRadius: '50%', 
        cursor: 'grab', 
        backgroundImage: token.backgroundImage ? `url(${token.backgroundImage})`:'', 
        backgroundSize: '100% 100%'
      }} />
      {context ? <div style={{position: "absolute", width: '100px', height: '100px', backgroundColor: '#333333'}}></div>:<></>}
    </div>
   </>
  )
}

export default Token;
