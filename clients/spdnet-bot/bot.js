const { Client, Intents } = require("discord.js");
const { discord, server } = require("./config.json");
const io = require("socket.io-client");

// Util
const sendTo = (o, text) => {
  if (ready && o) o.send(text);
};

const sendToMain = (text) => sendTo(mainChannel, text);

// Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ["CHANNEL"],
});

// Globals
let ready = false;
let socket = null;

let mainChannel = null;
let spamChannel = null;
let currentChannel = null;

//TODO: set botname from discord info
const botName = "spdnet-bot";

//TODO: don't cache your own users, get them from server
const players = new Map();

// Begin bot
client.login(discord.key).catch((err) => {
  console.log(err.message);
});

client.on("ready", () => {
  client.channels
    .fetch(discord.mainChannelId)
    .then((c) => {
      mainChannel = c;
    })
    .catch((e) => console.log("get main channel", discod.mainChannelId, e));

  client.channels
    .fetch(discord.spamChannelId)
    .then((c) => {
      spamChannel = c;
      ready = true;
    })
    .catch((e) => console.log("get spam channel", discod.spamChannelId, e));

  socket = io(server.address, {
    query: { version: 9999 },
    auth: { token: server.key },
  });

  const handler = socketHandler();

  socket.on("connect", () => sendToMain("Connected to SPDNet"));
  socket.on("disconnected", () => sendToMain("Disconnected from SPDNet"));
  socket.on("chat", (id, nick, message) => handler.handleChat(id, nick, message));
  socket.on("join", (nick, id) => handler.handleJoin(nick, id));
  socket.on("leave", (nick, id) => handler.handleLeave(nick, id));
  socket.on("action", (type, data) => handler.handleAction(type, data));
  socket.on("connect_error", (err) => handler.handleConnectionError(err));
});

// Socket handler
const socketHandler = () => {
  return {
    handleConnectionError: (err) => console.log(err),
    handleChat: (id, nick, message) =>
      sendTo(spamChannel, `**${nick}**: ${message}`),
    handleJoin: (nick, id) => {
      players.set(nick, id);
      sendTo(spamChannel, `*${nick} has joined*`);
    },
    handleLeave: (nick) => {
      players.delete(nick);
      sendTo(spamChannel, `*${nick} has left*`);
    },
    handleAction: (type, data) => {
      const actions = {
        GLOG: 5,
      };
      const process = {
        [actions.GLOG]: (data) => sendTo(spamChannel, `*${data.msg}*`),
      };
      process[type](JSON.parse(data));
    },
  };
};

// Command handler
const cmd = (text, user) => {
  handle = {
    taco: () => sendTo(currentChannel, `taco?!`),
    say: ({ args }) => {
      if (args.length) sendTo(currentChannel, args.join(" "));
    },
    online: () => {
      if (players.size) {
        const list = Array.from(players.keys()).join(", ");
        sendTo(currentChannel, list);
      } else sendTo(currentChannel, "No one is playing!");
    },
    give: ({ args }) => {
      if (args.length < 4) {
        sendTo(
          currentChannel,
          `\`!give [item count] [item class name ] [item level] [player name]\`\n 
	     Player names are case sensitive. Use !online to see a list of current players`
        );
        return;
      }

      const [numberofItems, className, itemLevel, ...playerNameList] = args;
      const playerName = playerNameList.join(" ");
      const player = players.get(playerName);
      const count = Number.parseInt(numberofItems);
      const level = Number.parseInt(itemLevel);
      const isValidNumber = count > 0 && count < 4;

      if (!count) {
        sendTo(currentChannel, `Invalid item count!`);
        return;
      }

      if (!level) {
        sendTo(currentChannel, `Invalid item level!`);
        return;
      }

      if (player) {
        if (isValidNumber) {
          // Literally send it n amount of times lol
          for (let i = 0; i < count; i++)
            socket.emit(
              "transfer",
              JSON.stringify({
                className: className,
                cursed: false,
                id: player,
                identified: true,
                level,
              }),
              () => {}
            );
        } else
          sendTo(
            currentChannel,
            `Invalid number: ${numberofItems}. Number of items must be 1 - 3.`
          );
      } else sendTo(currentChannel, `No player: ${playerName}!`);
    },
    register: ({ user }) => {
      const { id, username, discriminator } = user;
      socket.emit("admin", 0, { id, username, discriminator }, (key) =>
        sendTo(user, `Your key is ${key}`)
      );
    },
    help: () =>
      sendTo(
        currentChannel,
        "`!register` - register for SPDNet\n" +
          "`!online` - list online players\n" +
          "`!give [item count] [item class name ] [item level] [player name]` - give a player an item\n" +
          "`!say [text]` - say text\n" +
          "`!help` - this help"
      ),
    default: () => {
      // Unlisted command action here
    },
  };
  const args = text.split(" ");
  const c = args[0];
  args.shift();
  if (c && c.substring(0, 1) == "!")
    (handle[c.substring(1)] || handle["default"])({ args, user });
};

// Bot events
client.on("messageCreate", (message) => {
  const { content, author, channel } = message;
  const username = author.username;
  currentChannel = channel;
  if (!username.includes(botName)) cmd(content, author);
});
