import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {type Placement} from './types.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let users = 0;
let placementCount = 0;
let placed: {[id: number]: Placement} = {}; // A dictionary of items that have been placed.
let presets: Placement[] = []; // An array of preset items.

// Board values
let width: number = 11;
let height: number = 11;
let image: string = '';
let squareSize: number = 100;

io.on("connection", (socket: Socket) => {
    users += 1;
    console.log("Connection:", users);

    io.emit('users', users);

    socket.on('disconnect', () => {
      users -= 1;
      socket.broadcast.emit("users", users);
      console.log("Disconnected:", users);
    });

    // Sent by: GridSquare.tsx
    // Sends to: Board.tsx
    socket.on('place', (row: number, col: number, placement: Placement) => place(row, col, placement))
    // Sent by: BoardMenu.tsx
    // Sent to: Board.tsx
    socket.on('board-update', (newWidth: number, newHeight: number, newImage: string, newSquareSize: number) => updateBoard(newWidth, newHeight, newImage, newSquareSize));
    // Sent by: Board.tsx
    socket.on('get-board', (callback) => callback(width, height, image, squareSize, Object.values(placed).filter(placement => placement.type === 'token'), Object.values(placed).filter(placement => placement.type === 'tile')))
    // Sent by: TokenHolder.tsx
    // Sends to: Board.tsx
    socket.on('remove', (preset: Placement) => remove(preset))
    // Sent by: PresetTokenMenu.tsx, PresetTileMenu.tsx
    // Sends to: TokenHolder.tsx, TileHolder.tsx
    socket.on('add-preset', (preset: Placement) => addPreset(preset));
    // Sent by: TokenHolder.tsx, TileHolder.tsx
    socket.on('get-presets', (type: string, callback: (presets: Placement[]) => void) => callback(presets.filter(preset => preset.type === type)));
});

function place(row: number, col: number, placement: Placement) {
  if(row === undefined || col === undefined)
    return;
  if(placement.id < 0) {
    placement.id = placementCount++; // Placement was not previously defined, so we create a unique placement id.
  }
  else {
    io.emit('remove', placement);
  }
  placement.x = row;
  placement.y = col;
  placed[placement.id] = placement; 
  io.emit('place', placement, row, col); // Emit before changing placement. This tells the frontend important info.
}

function remove(placement: Placement) { 
  if(placed[placement.id] === undefined)
    return;

  delete placed[placement.id];
  
  io.emit('remove', placement);
}

function addPreset(preset: Placement) {
  preset.contentID = presets.length;
  presets.push(preset);
  io.emit('preset-' + preset.type, preset);
}

function updateBoard(newWidth: number, newHeight: number, newImage: string, newSquareSize: number) {
  width = newWidth;
  height = newHeight;
  image = newImage;
  squareSize = newSquareSize;
  console.log(width, height, image, squareSize);
  io.emit('board-update', width, height, image, squareSize);
}

app.use(express.static('../frontend/dist'));

const port = 8080
httpServer.listen(port, () => {
  console.log("Listening on port", port)
});