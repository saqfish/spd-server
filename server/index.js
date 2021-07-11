const { handleJoinRoom } = require("./adapter/joinRoom");
const { handleLeaveRoom } = require("./adapter/leaveRoom");
const { handlePlayerListRequest } = require("./events/playerListRequest");
const { handleDisconnect } = require("./events/disconnect");
const { handleMessages } = require("./events/messages");
const { handleActions } = require("./events/actions");
const { handleAuth, motd } = require("./middlewares/auth");
const { PORT, SEED, keys } = require("../defaults");
const events = require("./events/events");
const { log } = require("./util");
const send = require("./send");

const sockets = new Map();
const players = new Map();
for (p of keys) players.set(p.key, { nick: p.nick });

const io = require("socket.io")(PORT, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  handleAuth(sockets, players, socket, token)
    .then(() => next())
    .catch((e) => next(e));
});

io.on("connection", (socket) => {
  log(socket.id, "connected");
  socket.emit(events.MOTD, JSON.stringify(motd("", SEED)));
  socket.on(events.DISCONNECT, () => handleDisconnect(sockets, socket));
  socket.on(events.MESSAGE, (type, data) => handleMessages(sockets, players, socket, type, data));
  socket.on(events.ACTION, (type, data) =>  handleActions(sockets, players, socket, type, data));
  socket.on(events.PLAYERLISTREQUEST, (type, data) =>  handlePlayerListRequest(sockets, players, socket, type, data));
});

io.of("/").adapter.on("join-room", (room, id) => {
  const rooms = io.sockets.adapter.rooms.get(room);
  handleJoinRoom(sockets, rooms, id).then(res => io.to(id).emit(events.ACTION, send.JOIN_LIST, res));
      
}); 
io.of("/").adapter.on("leave-room", (room, id) => handleLeaveRoom(room, id)); 
