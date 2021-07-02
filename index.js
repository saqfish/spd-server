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

const depth = (d) => `${defaults.room}-${d}`;
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
    let room;
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
          sockets.set(socket.id, { ...players.get(json.key) });
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
            room = depth(json.depth);
            joinDepthRoom(socket, room, player.nick);
            log(player.nick, "->", "ASCEND", room);
            break;
          case actions.DESC:
            log(player.nick, "<-", "DESCEND", json.depth);
            room = depth(json.depth);
            joinDepthRoom(socket, room, player.nick);
            break;
          case actions.MOVE:
            log(player.nick, "<-", "MOVE", json.depth, json.dst);
            room = depth(json.depth);
            socket.to(room).emit(
              "action",
              JSON.stringify({
                type: actions.MOVE,
                player,
                data: {
                  depth: json.depth,
                  dst: json.dst,
                },
              })
            );
            log(player.nick, "->", "MOVE", room);
            break;
        }
        break;
      default:
        log(socket.id, "<-", "UNKNOWN", type, data);
        break;
    }
  });
});

const joinDepthRoom = (socket, depth, nick) => {
  if (socket.rooms.size) {
    for (r of socket.rooms) {
      if (r != socket.id) {
        socket.to(r).emit("action", `${nick} left ${r}`);
        socket.leave(r);
      }
    }
  }
  socket.join(depth);
  socket.to(depth).emit("action", `${nick} joined ${depth}`);
};

io.of("/").adapter.on("join-room", (room, id) => {
  const s = sockets.get(id);
  log(id, `${id} joined ${room}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
  const s = sockets.get(id);
  log(id, `${id} left ${room}`);
});
