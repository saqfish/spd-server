const socket = require("socket.io-client")("http://127.0.0.1:5500", { secure: true, reconnection: true, rejectUnauthorized: false });

socket.on("connect_error", (err) => {
	  console.log(`connect_error due to ${err.message}`);
});
