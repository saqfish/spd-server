const { log } = require("../util");
const events = require("./events");
const send = require("../send");

const disconnect = (sockets, socket) => {
  log(socket.id, "disconnected");
  const s = sockets.get(socket.id);
  for (const room of socket.rooms) {
    if (room !== socket.id) {
      let payload = JSON.stringify({
        id: socket.id,
        playerClass: s.playerClass,
        nick: s.nick,
        depth: s.depth,
        pos: s.pos,
      });
      socket.to(room).emit(events.ACTION, send.LEAVE, payload);
    }
  }
  socket.broadcast.emit(events.LEAVE, s.nick);
  sockets.delete(socket.id);
};

module.exports = disconnect;
