const log = (k, ...m) => console.log(`${k}:`, ...m);

const playerPayload = (id, playerClass, nick, depth, pos) =>
  JSON.stringify({ id, playerClass, nick, depth, pos });

const sortSocketsByDepth = (sockets) => {
  const socketsArr = new Map(
    [...sockets.entries()].sort((a, b) => {
      return !b[1].depth || !a[1].depth ? -1 : b[1].depth - a[1].depth;
    })
  );
  sockets.clear();
  socketsArr.forEach((s) => sockets.set(s.socket.id, s));
};

const sendMessage = (socket, type, data) => {
  const json = {
    type: null ? send.MESSAGE : type,
    data,
  };
  socket.emit("message", JSON.stringify(json));
};

module.exports = {
  log,
  playerPayload,
  sortSocketsByDepth,
  sendMessage,
};
