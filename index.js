const defaults = require("./defaults");
const loglevel = require("loglevel");
const io = require("socket.io")(defaults.port, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

const types = require("./types");
const actions = require("./actions");
const { motd, sendMessage } = require("./messages");
const playerList = require("./players");

const players = new Map();
for (p of playerList) players.set(p.key, { nick: p.nick });

const sockets = new Map();

const depth = (d) => `defaults.room-${d}`;
const SEED = defaults.seed;

const log = (k, ...m) => console.log(`${k}:`, ...m);

io.on("connection", (socket) => {
  log(socket.id, "connected");

  // handle disconnect
  socket.on("disconnect", (reason) => {
    log(socket.id, "disconnected");
    sockets.delete(socket.id);
  });

  // send auth request
  socket.emit("message", types.SEND.AUTH, null);
  log("AUTH", `-> ${socket.id}`);

  // handle messages
  socket.on("message", (type, data) => {
    let json;
    let player;
    switch (type) {
      case types.RECEIVE.AUTH:
        json = JSON.parse(data);
        log(socket.id, "<-", "AUTH", json.key);
        if (sockets.has(socket.id)) {
          // multiple auth, disconnect
	  socket.disconnect();
          return;
        }
        if (players.has(json.key)) {
          const player = players.get(json.key);
          sockets.set(socket.id, { socket, ...players.get(json.key) });
          socket.emit("motd", JSON.stringify(motd(player.nick, SEED)));
          log(socket.id, `identified as ${player.nick}`);
        } else {
          log(socket.id, `Invalid key: ${json.key}`);
          sendMessage(socket, null, "You are not authorized!");
          socket.disconnect();
        }
        break;
      case types.RECEIVE.ACTION:
        player = sockets.get(socket.id);
        json = JSON.parse(data);
        switch (json.type) {
          case actions.ASC:
            log(player.nick, "<-", "ASCEND", json.depth);
            socket.join(depth(json.depth));
            break;
          case actions.DESC:
            log(player.nick, "<-", "DESCEND", json.depth);
            socket.join(depth(json.depth));
            break;
          case actions.MOVE:
            log(player.nick, "<-", "MOVE", json.dst);
            break;
        }
        break;
      default:
        log(socket.id, "<-", "UNKNOWN", type, data);
        break;
    }
  });
});

io.of("/").adapter.on("join-room", (room, id) => {
  if (room.includes(defaults.room)) {
    const s = sockets.get(id);
    log(id, `aka ${s.nick} joined ${room}`);
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {
  if (room.includes(defaults.room)) {
    const s = sockets.get(id);
    log(s.nick, `left room ${room}`);
  }
});
