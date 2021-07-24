const path = require("path");
const fs = require('fs');

const log = (k, ...m) => console.log(`${k}:`, ...m);
let keyval = (obj, i) => [Object.keys(obj)[i],Object.values(obj)[i]];

const playerPayload = (id, playerClass, nick, depth, pos, items) =>
  JSON.stringify({ id, playerClass, nick, depth, pos, items });

const sortSocketsByDepth = (sockets) => {
  const socketsArr = new Map(
    [...sockets.entries()].sort((a, b) => {
      return !b[1].depth || !a[1].depth ? -1 : b[1].depth - a[1].depth;
    })
  );
  sockets.clear();
  socketsArr.forEach((s) => sockets.set(s.socket.id, s));
};

const sendMessage = (socket, type, data) => {
  const json = {
    type: null ? send.MESSAGE : type,
    data,
  };
  socket.emit("message", JSON.stringify(json));
};

const readConfig = () => {
  return new Promise((res, rej) =>
    fs.readFile(path.resolve(__dirname, "../config.json"), 'utf8', function (err, data) {
      if (err) {
        rej({});
      }
      res(JSON.parse(data));
    }));
}

module.exports = {
  log,
  keyval,
  playerPayload,
  sortSocketsByDepth,
  sendMessage,
  readConfig,
};
