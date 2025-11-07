import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {type Token, type Placement} from './types.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let users = 0;
let placementCount = 0;
let placed: {[id: number]: Token} = {}; // A dictionary of tokens that have been placed.
let presets: Token[] = []; // An array of preset tokens.

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
    socket.on('place', (row: number, col: number, token: Token) => place(row, col, token))
    // Sent by: BoardMenu.tsx
    // Sent to: Board.tsx
    socket.on('board-update', (newWidth: number, newHeight: number, newImage: string, newSquareSize: number) => updateBoard(newWidth, newHeight, newImage, newSquareSize));
    // Sent by: Board.tsx
    socket.on('get-board', (callback) => callback(width, height, image, squareSize, Object.values(placed)))
    // Sent by: TokenHolder.tsx
    // Sends to: Board.tsx
    socket.on('remove', (placement: Placement) => remove(placement))
    // Sent by: PresetMenu.tsx
    // Sends to: TokenHolder.tsx
    socket.on('add-preset', (preset: Token) => addPreset(preset));
    // Sent by: TokenHolder.tsx
    socket.on('get-presets', (callback) => callback(presets));
});

function place(row: number, col: number, token: Token) {
  let placement = {x: row, y: col, id: -1};
  console.log('Placing!', token);
      
  if(token.placement === undefined) {
    placement.id = placementCount++; // Placement was not previously defined, so we create a unique placement id.
    io.emit('place', placement, token); // Emit before changing placement. This tells the frontend important info.
    token.placement = placement;
    placed[token.placement.id] = token;
  }
  else {
    placement.id = token.placement.id; // The placement id must be maintained.
    io.emit('place', placement, token); // Emit before changing placement. This tells the frontend important info.
    placed[token.placement.id]!.placement = placement;
  }
}

function remove(placement: Placement) {
  if(!placement)
    return;
  
  if(placed[placement.id])
    delete placed[placement.id];
  console.log('removed', placement.id);
  io.emit('remove', placement);
}

function addPreset(preset: Token) {
  preset.id = presets.length;
  presets.push(preset);
  io.emit('preset', preset);
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