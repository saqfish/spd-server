const {Client, Intents} = require('discord.js');
const {discord, server} = require('./config.json');
const io = require("socket.io-client");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.login(discord.key).catch((err) => {
	console.log(err.message);
});

let channel = null;
let ready = false;

const send = (text) => {
	if(channel && ready)
		channel.send(text);
}

client.on('ready', () => {
	channel = client.channels.fetch(discord.channelId).then(c => {
		channel = c;
		ready = true;
	});

	const socket = io(server.address, {
		auth: {
			token: server.key,
		},
	});

	socket.on("connect_error", (err) => {
		console.log(err);
	});

	socket.on("chat", (id, nick, message) => send(`${nick}: ${message}`));
	socket.on("join", (nick) => send(`${nick} has joined`));
	socket.on("leave", (nick) => send(`${nick} has left`));

	const actions = {
		JOIN: 1,
		JOIN_LIST: 2,
		LEAVE: 3,
		// only using GLOG for now
		GLOG: 5,
	};

	socket.on("action", (type, data) => {
		const process = {
			[actions.GLOG]: (data) => {
				send(data.msg);
			}
		}
		process[type](JSON.parse(data));
	});
});

client.on('message', message => {
	console.log(message);
});
