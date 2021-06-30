const Types = require("./types");
const { version } = require("./package");

const motd  = (nick) => `Hello ${nick}! Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! Build: ${version}`;

const sendMessage = (socket, message) => {
  const json = { message: message };
  socket.emit("message", Types.Send.MESSAGE, JSON.stringify(json));
};

module.exports = {motd, sendMessage};
