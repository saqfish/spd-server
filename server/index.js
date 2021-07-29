const { port, seed, itemSharing } = require("../config");
const handler = require("./handler");
const events = require("./events/events");
const send = require("./send");

const sockets = new Map();

const io = require("socket.io")(port, {
  serveClient: false,
  cookie: false,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  handler.handleAuth(sockets, socket, token)
    .then(() => next())
    .catch((e) => next(e));
});

io.on("connection", (socket) => {
  socket.emit(events.MOTD, handler.motd(seed));
  socket.on(events.DISCONNECT, () => handler.handleDisconnect(sockets, socket));
  socket.on(events.ADMIN, () => handler.handleAdmin());
  socket.on(events.ACTION, (type, data) =>  handler.handleActions(sockets, socket, type, data));
  socket.on(events.PLAYERLISTREQUEST, () =>  handler.handlePlayerListRequest(sockets, socket));
  socket.on(events.TRANSFER, (data, cb) => handler.handleTransfer(socket, sockets, data).then(res => {
    if (itemSharing)
      io.to(res.id).emit(events.TRANSFER, JSON.stringify(res));
    cb(itemSharing);
  }));
  socket.on(events.CHAT, (message) => {
    let player = sockets.get(socket.id);
    io.emit(events.CHAT, socket.id, player.nick, message);
  });
});

io.of("/").adapter.on("join-room", (room, id) => {
  const rooms = io.sockets.adapter.rooms.get(room);
  handler.handleJoinRoom(sockets, rooms, id).then(res => io.to(id).emit(events.ACTION, send.JOIN_LIST, res));
}); 

io.of("/").adapter.on("leave-room", (room, id) => handler.handleLeaveRoom(room, id)); 
