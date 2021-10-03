const { readConfig, writeConfig } = require("../../util");

const isSeedValid = (data) => {
  const seed = Number.parseInt(data);
  if (!seed) return false;
  if (seed < 1 || seed > 999999999) return false;
  return true;
};


module.exports = (data, rej, res) => {
  const { username, seed } = data;
  readConfig()
    .then((config) => {
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
              res(
                "Invalid seed. Seed must be a number between 0 and 999999999"
              );
          }
        }
      }
    })
    .catch(() => {
      rej();
    });
};
