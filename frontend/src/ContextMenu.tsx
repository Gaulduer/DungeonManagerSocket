type Context = {
    name: string;
    callback: () => void;
}

type ContextMenuProps = {
    x: number;
    y: number;
    contexts: Context[];
}

export function ContextMenu(props: ContextMenuProps) {
    return <>
        <div style={{position: "absolute", left: props.x + 'px', top: props.y + 'px', width: '100px', height: '100px'}}></div>
    </>
}