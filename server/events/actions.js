const { ROOMPREFIX } = require("../../defaults");
const events = require("./events");
const { log, playerPayload, sortSocketsByDepth } = require("../util");

const actions = {
  ASC: 0,
  DESC: 1,
  MOVE: 2,
  JOIN: 3,
  JOIN_LIST: 4,
  LEAVE: 5,
};

const handleActions = (...args) => {
  let [sockets, players, socket, type, data] = args;
  let player = sockets.get(socket.id);
  if (!player) socket.disconnect();
  let json = JSON.parse(data);
  room = depthToRoom(json.depth);

  const handler = {
    [actions.ASC]: ({ sockets, players, socket, type, data }) => {
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
    },
    [actions.DESC]: ({ sockets, players, socket, type, data }) => {
      log(player.nick, "<- DESCEND", json, `-> ${room}`);
      joinDepthRoom(
        socket,
        json.playerClass,
        json.depth,
        json.pos,
        player.nick
      );
      if (json.depth) {
        sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
      } else {
        sockets.set(socket.id, {
          ...sockets.get(socket.id),
          playerClass: null,
          depth: null,
          pos: null,
        });
      }
      sortSocketsByDepth(sockets);
    },
    [actions.MOVE]: ({ sockets, players, socket, type, data }) => {
      log(player.nick, "<- MOVE", json, `-> ${room}`);
      let payload = playerPayload(
        socket.id,
        json.playerClass,
        json.nick,
        json.depth,
        json.pos
      );
      socket.to(room).emit(events.ACTION, actions.MOVE, payload);
      sockets.set(socket.id, { ...sockets.get(socket.id), ...json });
    },
  };
  return (handler[type] || handler["default"])({
    sockets,
    players,
    socket,
    type,
    data,
  });
};

const depthToRoom = (d) => `${ROOMPREFIX}-${d}`;

const joinDepthRoom = (socket, playerClass, depth, pos, nick) => {
  if (socket.rooms.size) {
    for (r of socket.rooms) {
      if (r != socket.id) {
        let payload = playerPayload(socket.id, playerClass, nick, depth, pos);
        socket.to(r).emit(events.ACTION, actions.LEAVE, payload);
        socket.leave(r);
      }
    }
  }
  if (depth) {
    const room = depthToRoom(depth);
    socket.join(room);
    let payload = playerPayload(socket.id, playerClass, nick, depth, pos);
    socket.to(room).emit(events.ACTION, actions.JOIN, payload);
  }
};

module.exports = { handleActions };
