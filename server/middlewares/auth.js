const { log, readConfig } = require("../util");

const accountTypes = {
  ADMIN: 0,
  PLAYER: 1,
  BOT: 2,
};

const auth = (sockets, socket, token) =>
  new Promise((res, rej) => {
    readConfig().then((config) => {
      const { accounts } = config;
      const players = new Map();

      for (p of accounts)
        players.set(p.key, { nick: p.nick, role: getRole(p) });

      if (players.has(token)) {
        const player = players.get(token);
        sockets.set(socket.id, { socket, ...player });
        log(socket.id, `${player.nick} identified`, player.role);
        res();
      } else {
        log(socket.id, "rejected auth");
        const e = new Error(JSON.stringify({ type: 0, data: "Your key is invalid!" }));
        rej(e);
      }
    });
  });

const getRole = (p) => {
  if (p.bot) return accountTypes.BOT;
  if (p.admin) return accountTypes.ADMIN;
  return accountTypes.PLAYER;
};

module.exports = { auth, accountTypes };
