const io = require("socket.io")(5500, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} disconnected`);
  });
});
