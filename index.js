const defaults = require("./defaults");
const loglevel = require("loglevel");
const io = require("socket.io")(defaults.port, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

const types = require("./types");
const { motd, sendMessage } = require("./messages");
const playerList = require("./players");

const players = new Map();
for (p of playerList) players.set(p.key, { nick: p.nick });

const sockets = new Map();

const ROOM = defaults.room;
const SEED = defaults.seed;

const log = (k, ...m) => console.log(`${k}:`, ...m);

io.on("connection", (socket) => {
  log(socket.id, "connected");

  // handle disconnect
  socket.on("disconnect", (reason) => {
    log(socket.id, "disconnected");
  });

  // send auth request
  socket.emit("message", types.Send.AUTH, null);

  // handle messages
  socket.on("message", (type, data) => {
    log(socket.id, "<-", type, data);
    const json = JSON.parse(data);
    switch (type) {
      case types.Receive.AUTH:
        if (players.has(json.key)) {
          sockets.set(socket.id, { socket, ...players.get(json.key) });
          socket.join(ROOM);
        } else {
          log(socket.id, `Invalid key: ${json.key}`);
          sendMessage(socket, "You are not authorized!");
          socket.disconnect();
        }
        break;
    }
  });
});

io.of("/").adapter.on("join-room", (room, id) => {
  if (room === ROOM) {
    const s = sockets.get(id);
    log(id, `aka ${s.nick} joined ${room}`);
    sendMessage(s.socket, motd(s.nick));
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {
  if (room === ROOM) {
    const s = sockets.get(id);
    log(s.nick, `left room ${room}`);
  }
});
