const { log } = require("../util");
const { version } = require("../../package");

const handleAuth = (sockets, players, socket, token) => {
  return new Promise((res, rej) => {
    log("TOKEN", token);
    if (players.has(token)) {
      const player = players.get(token);
      sockets.set(socket.id, { socket, ...players.get(token) });
      log(socket.id, "identified as:", player.nick);
      res();
    } else {
      log(socket.id, "rejected auth");
      const e = new Error("Key rejected");
      rej(e);
    }
  });
};

const motd = (nick, seed) => ({
  motd: `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! \nBuild: ${version}`,
  seed,
});

module.exports = {
  handleAuth,
  motd
};
