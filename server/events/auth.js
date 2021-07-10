const { log, sendMessage } = require("../util");
const events = require("./events");
const { SEED } = require("../../defaults");
const { version } = require("../../package");

const handleAuth = (sockets, players, socket, data) => {
  let json = JSON.parse(data);
  if (sockets.has(socket.id)) {
    socket.disconnect();
    return;
  }
  if (players.has(json.key)) {
    const player = players.get(json.key);
    const payload = motd(player.nick, SEED);
    sockets.set(socket.id, { socket, ...players.get(json.key) });
    socket.emit(events.MOTD, JSON.stringify(payload));
    log(socket.id, "identified as:", player.nick);
  } else {
    log(socket.id, "invalid key:", json.key, "-> rejected!");
    sendMessage(socket, null, "You are not authorized!");
    socket.disconnect();
  }
};

const motd = (nick, seed) => ({
  motd: `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! \nBuild: ${version}`,
  seed,
});

module.exports = {
  handleAuth,
};
