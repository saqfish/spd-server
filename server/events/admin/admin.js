const { log } = require("../../util");
const register = require("./register");
const seed = require("./seed");

const Types = {
  REGISTER: 0,
  SEED: 1,
};

const admin = (type, data, sockets, socket) => {
  log("ADMIN", type);
  return new Promise((resolve, reject) => {
    const handler = {
      [Types.REGISTER]: (data, rej, res) => register(data, rej, res),
      [Types.SEED]: (data, rej, res) => seed(data, rej, res),
      default: (data, rej) => {
        rej();
      },
    };
    func = handler[type] || handle["defualt"];
    func(data, reject, resolve, sockets, socket);
  });
};

module.exports = admin;
