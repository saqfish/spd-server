const { SEED } = require("../defaults");
const { version } = require("../package");
const types = require("./types");
const actions = require("./actions");
const { log, depthToRoom, joinDepthRoom, playerPayload } = require("./util");

const motd = (nick, seed) => ({
  motd: `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! Build: ${version}`,
  seed,
});

const sendMessage = (socket, type, data) => {
  const json = {
    type: null ? types.SEND.MESSAGE : type,
    data,
  };
  socket.emit("message", JSON.stringify(json));
};

const handleMessages = (sockets, players, socket, type, data) => {
  let json = JSON.parse(data);
  const messages = {
    [types.RECEIVE.AUTH]: (socket, json) => {
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
    [types.RECEIVE.ACTION]: (socket, json) => {
      let player = sockets.get(socket.id);
      room = depthToRoom(json.depth);
      switch (json.type) {
        case actions.ASC:
          log(player.nick, "<- ASCEND", json, `-> ${room}`);
          joinDepthRoom( socket, json.playerClass, json.depth, json.pos, player.nick);
          sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
          break;
        case actions.DESC:
          log(player.nick, "<- DESCEND", json, `-> ${room}`);
          joinDepthRoom( socket, json.playerClass, json.depth, json.pos, player.nick
          );
          sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
          break;
        case actions.MOVE:
          log(player.nick, "<- MOVE", json, `-> ${room}`);
          let payload = playerPayload( socket.id, player.playerClass, player.nick, json.depth, json.pos);
          socket.to(room).emit(types.SEND.ACTION, actions.MOVE, payload);
          sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
          break;
      }
    },
    default: () => {
      log(socket.id, "<-", "UNKNOWN", type, json);
    },
  };
  return (messages[type] || messages["default"])(socket, json);
};

module.exports = { sendMessage, handleMessages };
