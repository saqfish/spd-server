const { Client, Intents } = require("discord.js");
const { discord, server } = require("./config.json");
const io = require("socket.io-client");

// Util
const send = (text) => {
  if (channel && ready) channel.send(text);
};

// Discord client
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Globals
let channel = null;
let ready = false;
let socket;
const botName = "spdnet-bot";
const players = new Map();

// Begin bot
client.login(discord.key).catch((err) => {
  console.log(err.message);
});

client.on("ready", () => {
  channel = client.channels.fetch(discord.channelId).then((c) => {
    channel = c;
    ready = true;
  });

  socket = io(server.address, {
    query: { version: 9999 },
    auth: { token: server.key },
  });

  const handler = socketHandler();

  socket.on("chat", (id, nick, message) =>
    handler.handleChat(id, nick, message)
  );
  socket.on("join", (nick, id) => handler.handleJoin(nick, id));
  socket.on("leave", (nick, id) => handler.handleLeave(nick, id));
  socket.on("action", (type, data) => handler.handleAction(type, data));
  socket.on("connect_error", (err) => handler.handleConnectionError(err));
});

// Socket handler
const socketHandler = () => {
  return {
    handleConnectionError: (err) => console.log(err),
    handleChat: (id, nick, message) => send(`**${nick}**: ${message}`),
    handleJoin: (nick, id) => {
      players.set(nick, id);
      send(`*${nick} has joined*`);
    },
    handleLeave: (nick) => {
      players.delete(nick);
      send(`*${nick} has left*`);
    },
    handleAction: (type, data) => {
      const actions = {
        GLOG: 5,
      };
      const process = {
        [actions.GLOG]: (data) => send(`*${data.msg}*`),
      };
      process[type](JSON.parse(data));
    },
  };
};

// Command handler
const cmd = (text) => {
  handle = {
    taco: () => send(`taco?!`),
    say: (args) => {
      if (args.length) send(args.join(" "));
    },
    online: () => {
      if (players.size) {
        const list = Array.from(players.keys()).join(", ");
        send(list);
      } else send("No one is playing");
    },
    give: (args) => {
      const player = players.get(args[0]);
      if (player) {
        socket.emit(
          "transfer",
          JSON.stringify({
            className: args[1],
            cursed: false,
            id: player,
            identified: true,
            level: args[2],
          }),
          () => send("Sent")
        );
      } else send(`No player: ${args[0]}`);
    },
    default: () => {
      // Unlisted command action here
    },
  };
  const split = text.split(" ");
  const c = split[0];
  split.shift();
  if (c && c.substring(0, 1) == "!")
    (handle[c.substring(1)] || handle["default"])(split);
};

// Bot events
client.on("message", (message) => {
  const { content, author } = message;
  const username = author.username;
  if (!username.includes(botName)) cmd(content);
});
