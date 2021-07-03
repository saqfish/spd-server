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
  socket.emit(types.SEND.AUTH, types.SEND.AUTH, null);
  log("AUTH", `-> ${socket.id}`);

  // handle messages
  socket.on("message", (type, data) => {
    let json;
    let player;
    let room;
    switch (type) {
      case types.RECEIVE.AUTH:
        json = JSON.parse(data);
        log(socket.id, "<- AUTH", json.key);
        if (sockets.has(socket.id)) {
          // multiple auth, disconnect
          socket.disconnect();
          return;
        }
        if (players.has(json.key)) {
          const player = players.get(json.key);
          const payload = motd(player.nick, SEED);
          sockets.set(socket.id, { socket, ...players.get(json.key) });
          socket.emit(types.SEND.MOTD, JSON.stringify(payload));
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
        room = depth(json.depth);
        switch (json.type) {
          case actions.ASC:
            joinDepthRoom(socket, room, json.pos, player.nick);
            sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
            log(player.nick, "<- ASCEND", json, `-> ${room}`);
            break;
          case actions.DESC:
            joinDepthRoom(socket, room, json.pos, player.nick);
            sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
            log(player.nick, "<- DESCEND", json, `-> ${room}`);
            break;
          case actions.MOVE:
            socket.to(room).emit(
              types.SEND.ACTION,
              actions.MOVE,
              JSON.stringify({
                data: {
                  depth: json.depth,
                  pos: json.pos,
                },
              })
            );
            sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
            log(player.nick, "<- MOVE", json, `-> ${room}`);
            break;
        }
        break;
      default:
        log(socket.id, "<-", "UNKNOWN", type, data);
        break;
    }
  });
});

const joinDepthRoom = (socket, depth, pos, nick) => {
  if (socket.rooms.size) {
    for (r of socket.rooms) {
      if (r != socket.id) {
        let payload = JSON.stringify({ id: socket.id, nick });
        socket.to(r).emit(types.SEND.ACTION, actions.LEAVE, payload);
        socket.leave(r);
      }
    }
  }
  socket.join(depth);
  let payload = JSON.stringify({ id: socket.id, nick });
  socket.to(depth).emit(types.SEND.ACTION, actions.JOIN, payload);
};

io.of("/").adapter.on("join-room", (room, id) => {
  const r = new Set(io.sockets.adapter.rooms.get(room));
  r.delete(id);
  if (r.size) {
    const players = [...r];
    players.forEach((p, i) => {
      let { socket, nick, type, depth, pos } = sockets.get(p);
      players[i] = {
        id: socket.id,
        nick,
        type,
        depth,
        pos,
      };
    });
    let payload = JSON.stringify({
      data: {
        players,
      },
    });
    io.to(id).emit(types.SEND.ACTION, actions.JOINLIST, payload);
  }
});

io.of("/").adapter.on("leave-room", (room, id) => {});
