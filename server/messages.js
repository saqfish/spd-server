const { SEED } = require("../defaults");
const { version } = require("../package");
const types = require("./types");
const actions = require("./actions");
const {
  log,
  depthToRoom,
  joinDepthRoom,
  playerPayload,
  sortSocketsByDepth,
} = require("./util");

const motd = (nick, seed) => ({
  motd: `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! \nBuild: ${version}`,
  seed,
});

const sendMessage = (socket, type, data) => {
  const json = {
    type: null ? types.SEND.MESSAGE : type,
    data,
  };
  socket.emit("message", JSON.stringify(json));
};

const handleMessages = (...args) => {
  const messages = {
    [types.RECEIVE.AUTH]: (args) => {
      let { sockets, players, socket, type, data } = args;
      let json = JSON.parse(data);
      log(socket.id, "<- AUTH", json.key);
      if (sockets.has(socket.id)) {
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
    },
    [types.RECEIVE.ACTION]: (args) => {
      let { sockets, players, socket, type, data } = args;
      let player = sockets.get(socket.id);
      if (!player) socket.disconnect();
      let json = JSON.parse(data);
      room = depthToRoom(json.depth);
      switch (json.type) {
        case actions.ASC:
          log(player.nick, "<- ASCEND", json, `-> ${room}`);
          joinDepthRoom(
            socket,
            json.playerClass,
            json.depth,
            json.pos,
            player.nick
          );
          sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
          sortSocketsByDepth(sockets);
          break;
        case actions.DESC:
          log(player.nick, "<- DESCEND", json, `-> ${room}`);
          joinDepthRoom(
            socket,
            json.playerClass,
            json.depth,
            json.pos,
            player.nick
          );
          sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
          sortSocketsByDepth(sockets);
          break;
        case actions.MOVE:
          log(player.nick, "<- MOVE", json, `-> ${room}`);
          let payload = playerPayload(
            socket.id,
            json.playerClass,
            json.nick,
            json.depth,
            json.pos
          );
          socket.to(room).emit(types.SEND.ACTION, actions.MOVE, payload);
          sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
          break;
      }
    },
    [types.RECEIVE.PLAYERLISTREQUEST]: (args) => {
      let { sockets, players, socket, type, data } = args;
      const list = [];
      sockets.forEach((p, i) => {
        const get = (i, o) => {
          let { [i]: n } = o;
          if (n === 0) return n;
          return n || null;
        };
        list.push({
          nick: get("nick", p),
          playerClass: get("playerClass", p),
          depth: get("depth", p),
        });
      });
      let payload = JSON.stringify({ list });
      socket.emit(types.SEND.PLAYERLISTREQUEST, payload);
    },
    default: (args) => {
      let { sockets, players, socket, type, data } = args;
      let json = JSON.stringify(data);
      log(socket.id, "<-", "UNKNOWN", type, json);
    },
  };
  let [sockets, players, socket, type, data] = args;
  let nargs = { sockets, players, socket, type, data };
  return (messages[type] || messages["default"])(nargs);
};

module.exports = { sendMessage, handleMessages };
