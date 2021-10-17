const { log } = require("../util");

const transfer = (socket, sockets, data) =>
  new Promise((res, rej) => {
    const json = JSON.parse(data);
    const sender = sockets.get(socket.id);
    const reciever = sockets.get(json.id);
    if (sender && sender.role == 2) { // TODO: fix magic number use
      sockets.set(json.id, { ...reciever, invalidRecord: true });
    }
    log(socket.id, "<- TRANSFER", json, `-> ${json.id}`);
    res(json);
  });

module.exports = transfer;
