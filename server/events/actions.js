const { ROOMPREFIX } = require("../../defaults");
const { log, keyval, playerPayload, sortSocketsByDepth } = require("../util");
const events = require("./events");
const send = require("../send");
const receive = require("../receive");

const items = {
  all: 0,
  weapon: 1,
  armor: 2,
  artifact: 3,
  misc: 4,
  ring: 5,
}

const handleActions = (...args) => {
  let [sockets, socket, type, data] = args;
  let player = sockets.get(socket.id);
  if (!player) socket.disconnect();
  let json = JSON.parse(data);

  const handler = {
    [receive.INTERLEVEL]: ({ sockets, socket, json }) => {
      let room = depthToRoom(json.depth);
      log(player.nick, "<- INTERLEVEL", json, `-> ${room}`);
      joinDepthRoom(
        socket,
        json.playerClass,
        json.depth,
        json.pos,
        player.nick
      );
      if (json.depth == 0) {
        sockets.set(socket.id, {
          ...sockets.get(socket.id),
          playerClass: null,
          depth: null,
          pos: null,
          items: null,
        });
      } else
        sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
      sortSocketsByDepth(sockets);
    },
    [receive.MOVE]: ({ sockets, player, socket, json }) => {
      let room = depthToRoom(player.depth);
      log(player.nick, "<- MOVE", json, `-> ${room}`);
      let payload = playerPayload(
        socket.id,
        json.playerClass,
        json.nick,
        json.depth,
        json.pos
      );
      socket.to(room).emit(events.ACTION, send.MOVE, payload);
      sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
    },
    [receive.ITEM]: ({ sockets, player, socket, json }) => {
      let room = depthToRoom(player.depth);
      const s = sockets.get(socket.id);
      if (json.type) {
        const i = s.items;
        const kv = keyval(items, json.type);
        sockets.set(socket.id, { ...s, items: { ...i, [kv[0]]: { ...json } } });
        log(player.nick, "<- ITEM", kv[0], `-> ${room}`);
        let payload = JSON.stringify({
          id: socket.id,
          ...json
        });
        socket.to(room).emit(events.ACTION, send.ITEM, payload);
      } else {
        sockets.set(socket.id, { ...s, items: { ...json } });
      }
    },
    "default": ({ type, json }) => log("UNKNOWN", type, json)
  };
  return (handler[type] || handler["default"])({
    sockets,
    player,
    socket,
    type,
    json,
  });
};

const depthToRoom = (d) => `${ROOMPREFIX}-${d}`;

const joinDepthRoom = (socket, playerClass, depth, pos, nick) => {
  if (socket.rooms.size) {
    for (r of socket.rooms) {
      if (r != socket.id) {
        let payload = playerPayload(socket.id, playerClass, nick, depth, pos);
        socket.to(r).emit(events.ACTION, send.LEAVE, payload);
        socket.leave(r);
      }
    }
  }
  if (depth) {
    const room = depthToRoom(depth);
    socket.join(room);
    let payload = playerPayload(socket.id, playerClass, nick, depth, pos);
    socket.to(room).emit(events.ACTION, send.JOIN, payload);
  }
};

module.exports = { handleActions };
