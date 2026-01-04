import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import {type Placement} from './types.js';
import SQLHandler from './SQLHandler.js'

const sqlHandler = new SQLHandler();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let users = 0;
let placed: {[id: number]: Placement} = {}; // A dictionary of items that have been placed.
let presets: {[id: number]: Placement} = {}; // An array of preset items.

// Current settings
let campaignID: number = -1;
let mapID: number = -1;

// Board values
let width: number = 11;
let height: number = 11;
let image: string = '';
let squareSize: number = 100;

sqlHandler.createTables(sqlHandler.defaultTables).then(async () => {
  return await sqlHandler.getCampaignID("Default")
}).then(async campaignID => {
  return [campaignID, await sqlHandler.getMapID(campaignID, "Default")];
}).then(ids => {
  campaignID = ids[0];
  mapID = ids[1];
  getData();
  console.log(campaignID, mapID);
});

async function getData() {
  const presetData = await sqlHandler.getPresets(campaignID);
  const placementData = await sqlHandler.getPlacements(mapID);
  console.log(presetData);
  for (let i = 0 ; i < presetData.length ; i++) {
    const preset = {x: -1, y: -1, id: -1, type: presetData[i].type, contentID: presetData[i].id, content: presetData[i].content};
    presets[presetData[i].id] = preset;
    io.emit('preset-' + preset.type, preset);
    console.log("Adding preset:", preset);
  }

  for (let i = 0 ; i < placementData.length ; i++) {
    const placement: Placement = {x: placementData[i].x, y: placementData[i].y, id: placementData[i].id, type: presetData[i].type, contentID: presetData[i].preset_id, content: presets[placementData[i].preset_id]!.content};
    placed[placementData[i].id] = placement;
    io.emit('place', placement);
    //console.log("Adding placement:", placementData[i], placementData[i].preset_id, presets[placementData.]);
  }
  //console.log(presets);
}

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
    socket.on('get-presets', (type: string, callback: (presets: Placement[]) => void) => callback(Object.values(presets).filter(preset => preset.type === type)));
});

function place(row: number, col: number, placement: Placement) {
  console.log("Placing", row, col, placement);
  if(row === undefined || col === undefined)
    return;
  if(placement.id < 0) { // Placement was not previously defined, so we insert it into the sql table and give it an id.
    sqlHandler.insert("placement", [
      {column: 'map_id', value: mapID + ''},
      {column: 'x', value: col + ''},
      {column: 'y', value: row + ''},
      {column: 'preset_id', value: placement.contentID + ''}
    ]).then(id => {
      placement.id = id;
      placement.x = col;
      placement.y = row;
      placed[placement.id] = placement; 
      io.emit('place', placement);
    });
  }
  else {
    sqlHandler.updateByID("placement", placement.id, [
      {column: 'x', value: col + ''},
      {column: 'y', value: row + ''},
    ]).then(id => {
      io.emit('remove', placement); // Emit before placement is changed, this lets the front end delete the previous position.
      placement.x = col;
      placement.y = row;
      placed[placement.id] = placement; 
      io.emit('place', placement);
    });
  }
}

function remove(placement: Placement) { 
  if(placed[placement.id] === undefined)
    return;

  delete placed[placement.id];
  
  io.emit('remove', placement);
}

function addPreset(preset: Placement) {
  io.emit('preset-' + preset.type, preset);
  sqlHandler.insert('preset', [
    {column: 'campaign_id', value: campaignID + ''}, 
    {column: 'type', value: `'${preset.type}'`},
    {column: 'content', value: `'${preset.content}'`},
  ])
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