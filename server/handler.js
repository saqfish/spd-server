const joinRoom = require("./events/joinRoom");
const leaveRoom = require("./events/leaveRoom");
const playerListRequest = require("./events/playerListRequest");
const recordsRequest = require("./events/recordsRequest");
const disconnect = require("./events/disconnect");
const actions = require("./events/actions");
const transfer = require("./events/transfer");
const admin = require("./events/admin/admin");
const { auth } = require("./middlewares/auth");

const events = require("./events/events");
const send = require("./send");

const { version } = require("../package");
const { readConfig, readRecords, log } = require("./util");

const handler = (io) => {
  hio = io;
  const records = {};
  readRecords(records).then((res) => log("HANDLER", res));

  return {
    handlePlayerListRequest: playerListRequest,
    handleDisconnect: disconnect,
    handleLeaveRoom: leaveRoom,
    handleAdmin: (type, data, sockets, socket) => {
      return admin(type, data, sockets, socket);
    },
    init: (motd, seed, assetVersion) =>
      JSON.stringify({ motd, seed, assetVersion }),
    handleRecordsRequest: (socket) => recordsRequest(socket, records),
    handleActions: (sockets, socket, type, data) =>
      actions(sockets, socket, records, type, data),
    handleJoinRoom: (sockets, rooms, id) =>
      joinRoom(sockets, rooms, id).then((res) =>
        hio.to(id).emit(events.ACTION, send.JOIN_LIST, res)
      ),
    handleTransfer: (itemSharing, socket, sockets, data, cb) => {
      transfer(socket, sockets, data).then((res) => {
        if (itemSharing)
          hio.to(res.id).emit(events.TRANSFER, JSON.stringify(res));
        if (cb) cb(itemSharing);
      });
    },
    handleAuth: (sockets, socket, acceptableVersion, token, next) => {
      if (!acceptableVersion)
        next(
          new Error(
            JSON.stringify({
              type: 1,
              data: "Your game is outdated. Please update your version to play."
            })
          )
        );
      auth(sockets, socket, token)
        .then(() => {
          let player = sockets.get(socket.id);
          hio.emit(events.JOIN, player.nick, socket.id);
          next();
        })
        .catch((e) => next(e));
    },
    handleChat: (sockets, socket, message) => {
      let player = sockets.get(socket.id);
      hio.emit(events.CHAT, socket.id, player.nick, message);
    },
  };
};

module.exports = handler;
