const { version } = require("../package");
const { handleJoinRoom } = require("./adapter/joinRoom");
const { handleLeaveRoom } = require("./adapter/leaveRoom");
const { handlePlayerListRequest } = require("./events/playerListRequest");
const { handleDisconnect } = require("./events/disconnect");
const { handleActions } = require("./events/actions");
const { handleTransfer } = require("./events/transfer");
const { handleAuth } = require("./middlewares/auth");
const { handleAdmin } = require("./events/admin");
const { handleChat } = require("./events/chat");

const motd = (seed) => (JSON.stringify({
    motd: `Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! \nBuild: ${version}`,
    seed,
}));

module.exports = {
    handleJoinRoom,
    handleLeaveRoom,
    handlePlayerListRequest,
    handleDisconnect,
    handleActions,
    handleTransfer,
    handleAuth,
    handleAdmin,
    handleChat,
    motd
}
