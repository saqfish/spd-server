const { ROOMPREFIX } = require("../defaults");
const types = require("./types");
const actions = require("./actions");

const log = (k, ...m) => console.log(`${k}:`, ...m);
const depthToRoom = (d) => `${ROOMPREFIX}-${d}`;

const joinDepthRoom = (socket, playerClass, depth, pos, nick) => {
    if (socket.rooms.size) {
        for (r of socket.rooms) {
            if (r != socket.id) {
                let payload = playerPayload(socket.id, playerClass, nick, depth, pos);
                socket.to(r).emit(types.SEND.ACTION, actions.LEAVE, payload);
                socket.leave(r);
            }
        }
    }
    const room = depthToRoom(depth);
    socket.join(room);
    let payload = playerPayload(socket.id, playerClass, nick, depth, pos);
    socket.to(room).emit(types.SEND.ACTION, actions.JOIN, payload);
};

const playerPayload = (id, playerClass, nick, depth, pos) => JSON.stringify({ id, playerClass, nick, depth, pos, });

module.exports = {
    log,
    depthToRoom,
    joinDepthRoom,
    playerPayload
}
