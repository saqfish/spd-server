const { PORT, keys } = require("../defaults");
const { log } = require("./util");
const send = require("./send");
const events = require("./events/events");
const { handlePlayerListRequest } = require("./events/playerListRequest");
const { handleDisconnect } = require("./events/disconnect");
const { handleMessages } = require("./events/messages");
const { handleActions } = require("./events/actions");
const { handleAuth } = require("./events/auth");

const sockets = new Map();
const players = new Map();
for (p of keys) players.set(p.key, { nick: p.nick });

const io = require("socket.io")(PORT, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

io.on("connection", (socket) => {
  log(socket.id, "connected");
  socket.emit(events.AUTH, send.AUTH, null);

  socket.on(events.DISCONNECT, () => handleDisconnect(sockets, socket));
  socket.on(events.AUTH, (data) => handleAuth(sockets, players, socket, data));
  socket.on(events.MESSAGE, (type, data) => handleMessages(sockets, players, socket, type, data));
  socket.on(events.ACTION, (type, data) =>  handleActions(sockets, players, socket, type, data));
  socket.on(events.PLAYERLISTREQUEST, (type, data) =>  handlePlayerListRequest(sockets, players, socket, type, data));
});

io.of("/").adapter.on("join-room", (room, id) => {
  const r = new Set(io.sockets.adapter.rooms.get(room));
  r.delete(id);
  if (r.size) {
    const players = [...r];
    players.forEach((p, i) => {
      let { socket, playerClass, nick, depth, pos } = sockets.get(p);
      players[i] = { id: socket.id, playerClass, nick, depth, pos };
    });
    let payload = JSON.stringify({ players });
    io.to(id).emit(events.ACTION, send.JOIN_LIST, payload);
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {});
