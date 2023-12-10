const crypto = require("crypto");

let generateToken = (length) => {
    return crypto.randomBytes(length).toString("hex");
}

module.exports = {
  generateToken
}