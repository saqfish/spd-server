const { handleJoinRoom } = require("./adapter/joinRoom");
const { handleLeaveRoom } = require("./adapter/leaveRoom");
const { handlePlayerListRequest } = require("./events/playerListRequest");
const { handleDisconnect } = require("./events/disconnect");
const { handleMessages } = require("./events/messages");
const { handleActions } = require("./events/actions");
const { handleTransfer } = require("./events/transfer");
const { handleAuth, motd } = require("./middlewares/auth");
const { port, seed, itemSharing } = require("../config");
const events = require("./events/events");
const send = require("./send");

const sockets = new Map();

const io = require("socket.io")(port, {
  serveClient: false,
  cookie: false,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  handleAuth(sockets, socket, token)
    .then(() => next())
    .catch((e) => next(e));
});

io.on("connection", (socket) => {
  socket.emit(events.MOTD, JSON.stringify(motd("", seed)));
  socket.on(events.DISCONNECT, () => handleDisconnect(sockets, socket));
  socket.on(events.MESSAGE, (type, data) => handleMessages(sockets, socket, type, data));
  socket.on(events.ACTION, (type, data) =>  handleActions(sockets, socket, type, data));
  socket.on(events.PLAYERLISTREQUEST, () =>  handlePlayerListRequest(sockets, socket));
  socket.on(events.TRANSFER, (data, cb) => handleTransfer(socket, sockets, data).then(res => {
    if (itemSharing)
      io.to(res.id).emit(events.TRANSFER, JSON.stringify({ className: res.className }));
    cb(itemSharing);
  }));
});

io.of("/").adapter.on("join-room", (room, id) => {
  const rooms = io.sockets.adapter.rooms.get(room);
  handleJoinRoom(sockets, rooms, id).then(res => io.to(id).emit(events.ACTION, send.JOIN_LIST, res));
}); 

io.of("/").adapter.on("leave-room", (room, id) => handleLeaveRoom(room, id)); 
