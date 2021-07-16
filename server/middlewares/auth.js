const { readDefaults, log } = require("../util");
const { version } = require("../../package");

const handleAuth = (sockets, socket, token) =>
  new Promise((res, rej) => {
    readDefaults().then(defaults => {
      const { keys } = defaults;
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

const motd = (nick, seed) => ({
  motd: `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! \nBuild: ${version}`,
  seed,
});

module.exports = {
  handleAuth,
  motd
};
