const { readConfig, writeConfig } = require("../../util");

const genKey = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

module.exports = (data, rej, res) => {
  const { username } = data;
  const newKey = genKey();
  readConfig()
    .then((config) => {
      const found = config.accounts.find((acc) => acc.nick == username);
      if (!found) {
        const acc = { key: `${newKey}`, nick: username };
        config.accounts = [...config.accounts, acc];
        writeConfig(config).then(() => res(acc.key));
      } else res(found.key);
    })
    .catch(() => {
      rej();
    });
};
