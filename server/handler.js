const joinRoom = require("./adapter/joinRoom");
const leaveRoom = require("./adapter/leaveRoom");
const playerListRequest = require("./events/playerListRequest");
const disconnect = require("./events/disconnect");
const actions = require("./events/actions");
const transfer = require("./events/transfer");
const auth = require("./middlewares/auth");
const admin = require("./events/admin");

const events = require("./events/events");
const send = require("./send");

const { version } = require("../package");
const { readRecords, log } = require("./util");

const handler = (io) => {
    hio = io;
    const records = {};
    readRecords(records).then(res => log("HANDLER", res));

    return {
        handlePlayerListRequest: playerListRequest,
        handleDisconnect: disconnect,
        handleActions:(sockets, socket, type, data) => actions(sockets, socket, records, type, data),
        handleAdmin: admin,
        handleLeaveRoom: leaveRoom,
        handleJoinRoom: (sockets, rooms, id) =>
            joinRoom(sockets, rooms, id).then(res => hio.to(id).emit(events.ACTION, send.JOIN_LIST, res))
        ,
        handleTransfer: (itemSharing, socket, sockets, data, cb) => {
            transfer(socket, sockets, data).then(res => {
                if (itemSharing)
                    hio.to(res.id).emit(events.TRANSFER, JSON.stringify(res));
                cb(itemSharing);
            });
        },
        handleAuth: (sockets, socket, token, next) => {
            auth(sockets, socket, token)
                .then(() => next())
                .catch((e) => next(e));
        },
        handleChat: (sockets, socket, message) => {
            let player = sockets.get(socket.id);
            hio.emit(events.CHAT, socket.id, player.nick, message);
        },
        motd: (seed) => (JSON.stringify({
            motd: `Welcome to the test server. Please enjoy your stay and report all bugs to saqfish over on the discord! \nBuild: ${version}`,
            seed,
        })),
    }
}

module.exports = handler;
