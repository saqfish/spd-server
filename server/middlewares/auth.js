const { log, readConfig } = require("../util");

const auth = (sockets, socket, token) =>
  new Promise((res, rej) => {
    readConfig().then(config => {
      const { keys } = config;
      const players = new Map();
      for (p of keys) players.set(p.key, { nick: p.nick });
      if (players.has(token)) {
        const player = players.get(token);
        sockets.set(socket.id, { socket, ...players.get(token) });
        log(socket.id, "identified as:", player.nick);
        res();
      } else {
        log(socket.id, "rejected auth");
        const e = new Error("Your key is invalid!");
        rej(e);
      }
    })
  });

module.exports = auth;
