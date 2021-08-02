const { log } = require("../util");

const transfer = (socket, sockets, data) =>
   new Promise((res, rej) => {
      const json = JSON.parse(data);
      log(socket.id, "<- TRANSFER", json, `-> ${json.id}`);
      res(json);
   });


module.exports =  transfer ;
