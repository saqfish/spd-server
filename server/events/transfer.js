const { log } = require("../util");

const handleTransfer = (socket, sockets, data) =>
   new Promise((res, rej) => {
      const json = JSON.parse(data);
      log(socket.id, "<- TRANSFER", json, `-> ${json.id}`);
      res(json);
   });


module.exports = { handleTransfer };
