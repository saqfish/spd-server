const send = require("../send");

const handleJoinRoom = (sockets, rooms, id) => {
	return new Promise(res => {
		const r = new Set(rooms);
		r.delete(id);
		if (r.size) {
			const players = [...r];
			players.forEach((p, i) => {
				let { socket, playerClass, nick, depth, pos } = sockets.get(p);
				players[i] = { id: socket.id, playerClass, nick, depth, pos };
			});
			let payload = JSON.stringify({ players });
			res(payload);
		}
	});
};

module.exports = { handleJoinRoom };
