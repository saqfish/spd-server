const { readConfig, writeConfig, log } = require("../util");

const genKey = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

const admin = (type, data, sockets, socket, cb) => {
  log("ADMIN", type );
  if (type == 0) {
    const { username } = data;
    const newKey = genKey();
    readConfig().then((config) => {
      const found = config.accounts.find((acc) => acc.nick == username);
      if (!found) {
        const acc = { key: `${newKey}`, nick: username };
        config.accounts = [...config.accounts, acc];
        writeConfig(config).then(() => cb(acc.key));
      } else cb(found.key);
    });
  }
};

module.exports = admin;
