const { port, seed, itemSharing } = require("./data/config");
const handler = require("./handler");
const events = require("./events/events");

const sockets = new Map();

const io = require("socket.io")(port, {
  serveClient: false,
  cookie: false,
});

const EventHandler = handler(io);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  EventHandler.handleAuth(sockets, socket, token, next);
});

io.on("connection", (socket) => {
  socket.emit(events.MOTD, EventHandler.motd(seed));
  socket.on(events.ADMIN, () => EventHandler.handleAdmin());
  socket.on(events.DISCONNECT, () => EventHandler.handleDisconnect(sockets, socket));
  socket.on(events.PLAYERLISTREQUEST, () => EventHandler.handlePlayerListRequest(sockets, socket));
  socket.on(events.RECORDS, () => EventHandler.handleRecordsRequest(socket));
  socket.on(events.ACTION, (type, data) => EventHandler.handleActions(sockets, socket, type, data));
  socket.on(events.TRANSFER, (data, cb) => EventHandler.handleTransfer(itemSharing, socket, sockets, data, cb));
  socket.on(events.CHAT, (message) => EventHandler.handleChat(sockets, socket, message));
});

io.of("/").adapter.on("join-room", (room, id) =>
  EventHandler.handleJoinRoom(sockets, io.sockets.adapter.rooms.get(room), id))

io.of("/").adapter.on("leave-room", (room, id) => EventHandler.handleLeaveRoom(room, id)); 
