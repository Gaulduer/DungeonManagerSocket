import {useState} from 'react'
import {type Token as TokenType} from '../types/types.js'

type TokenProps = {
  token: TokenType
  heightOffset?: number;
  hovering?: boolean;
}

function Token(props: TokenProps) {
  const [grabbed, setGrabbed] = useState<boolean>(false);
  const [context, setContext] = useState<boolean>(false);

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('token', JSON.stringify(props.token));
    setGrabbed(true);
  }

  function handleDragEnd() {
    setGrabbed(false);
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setContext(true);
    console.log(props.token);
  }

  function handleMouseLeave(e: React.MouseEvent) {
    e.preventDefault();
    setContext(false);
  }

  return (
   <>
    <div id={props.token.id + ''} className="token" draggable 
      style={{
        position: props.token.placement === undefined ? 'relative':'absolute',
        zIndex: props.hovering || props.token.placement === undefined ? '2':'-1',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%', 
        height: '100%', 
        backgroundColor: props.token.outline ? props.token.outline:"#333333", 
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
      <div id={props.token.id + ''} className="innerToken" draggable style={{
        alignSelf: 'center', 
        width: '90%', 
        height: '90%', 
        backgroundColor: "#333333", 
        borderRadius: '50%', 
        cursor: 'grab', 
        backgroundImage: props.token.backgroundImage ? `url(${props.token.backgroundImage})`:'', 
        backgroundSize: '100% 100%'
      }} />
      {context ? <div style={{position: "absolute", width: '100px', height: '100px', backgroundColor: '#333333'}}></div>:<></>}
    </div>
   </>
  )
}

export default Token;
