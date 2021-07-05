const { PORT, keys } = require("../defaults");
const { log } = require("./util");
const types = require("./types");
const actions = require("./actions");
const { handleMessages } = require("./messages");

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

  socket.on("disconnecting", () => {
    log(socket.id, "disconnected");
    const s = sockets.get(socket.id);
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        let payload = JSON.stringify({ id: socket.id, playerClass: s.playerClass, nick: s.nick, depth: s.depth, pos: s.pos, });
        socket.to(room).emit(types.SEND.ACTION, actions.LEAVE, payload);
      }
    }
    sockets.delete(socket.id);
  });

  socket.emit(types.SEND.AUTH, types.SEND.AUTH, null);
  log("AUTH", `-> ${socket.id}`);

  socket.on("message", (type, data) => {
    handleMessages(sockets, players, socket, type, data);
  });
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
    io.to(id).emit(types.SEND.ACTION, actions.JOINLIST, payload);
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {});
