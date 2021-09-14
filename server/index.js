const { port, minVersion, motd, seed, assetVersion, itemSharing } = require("./data/config");
const handler = require("./handler");
const events = require("./events/events");

const sockets = new Map();

const io = require("socket.io")(port, {
  serveClient: false,
  cookie: false,
});

const EventHandler = handler(io);

io.use((socket, next) => {
  const {query, auth} = socket.handshake;
  const acceptableVersion = query.version >= minVersion;
  EventHandler.handleAuth(sockets, socket, acceptableVersion, auth.token, next);
});

io.on(events.CONNECT, (socket) => {
  socket.emit(events.INIT, EventHandler.init(motd, seed, assetVersion));
  socket.on(events.ADMIN, (type, data, cb) => EventHandler.handleAdmin(type, data, sockets, socket, cb));
  socket.on(events.DISCONNECT, () => EventHandler.handleDisconnect(sockets, socket));
  socket.on(events.PLAYERLISTREQUEST, () => EventHandler.handlePlayerListRequest(sockets, socket));
  socket.on(events.RECORDS, () => EventHandler.handleRecordsRequest(socket));
  socket.on(events.ACTION, (type, data) => EventHandler.handleActions(sockets, socket, type, data));
  socket.on(events.TRANSFER, (data, cb) => EventHandler.handleTransfer(itemSharing, socket, sockets, data, cb));
  socket.on(events.CHAT, (message) => EventHandler.handleChat(sockets, socket, message));
});

io.of("/").adapter.on(events.JOINROOM, (room, id) =>
  EventHandler.handleJoinRoom(sockets, io.sockets.adapter.rooms.get(room), id))

io.of("/").adapter.on(events.LEAVEROOM, (room, id) => EventHandler.handleLeaveRoom(room, id)); 
