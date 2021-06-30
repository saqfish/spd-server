const Types = require("./types");
const { version } = require("./package");

const motd = (nick, seed) => ({
  motd: `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! Build: ${version}`,
  seed,
});

const sendMessage = (socket, type, data) => {
  const json = { data };
  socket.emit(
    "message",
    type == null ? Types.SEND.MESSAGE : type,
    JSON.stringify(json)
  );
	console.log(JSON.stringify(json));
};

module.exports = { motd, sendMessage };
