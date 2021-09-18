const { readConfig, writeConfig, log } = require("../util");

const genKey = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

const isSeedValid = (data) => {
  const seed = Number.parseInt(data);
  if (!seed) return false;
  if (seed < 1 || seed > 999999999) return false;
  return true;
};

//TODO: clean this up, no if-else
const admin = (type, data, sockets, socket) => {
  log("ADMIN", type);
  return new Promise((res, rej) => {
    // register
    if (type == 0) {
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
    }
    // seed
    else if (type == 1) {
      const { username, seed } = data;
      readConfig().then((config) => {
          if (!seed) res(`Current seed is: ${config.seed}`);
          else {
            const found = config.accounts.find((acc) => acc.nick == username);
            if (!found) res("You are not registered");
            else {
              const admin = found.admin;
              if (!admin) res("You are not an admin");
              else {
                if (isSeedValid(seed)) {
                  config.seed = seed;
                  writeConfig(config).then(() => res(`Seed is now ${seed}`));
                } else
                  res( "Invalid seed. Seed must be a number between 0 and 999999999");
              }
            }
          }
        })
        .catch(() => {
          rej();
        });
    }
  });
};

module.exports = admin;
