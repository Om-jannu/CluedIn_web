const pool = require("../models/dbConnect");
const path = require("path");
const session = require("express-session");

module.exports = {
  get: (req, res) => {
    var Path = path.join(__dirname, "..", "views", "events");
    var session = req.session;
    if (session.userid != null) {
      res.render(Path, {
        userName: session.user_name,
        ProfileUrl: session.userProfileUrl,
      });
    } else res.redirect("/");
  },
};
