const session = require("express-session");
const path = require("path");

module.exports = {
  get: (req, res) => {
    // //absolute path
    // console.log(res.sendFile('views/Index.html', { root: '.' }));
    let session = req.session;
    if (session.userid) {
      res.redirect("/dashboard");
    } 
    else {
      console.log("redirect to /");
      var Path = path.join(__dirname, "..", "views", "login");
      res.render(Path, { Emsg : req.flash("Emsg")});
    }

    // res.render('index');

    // var qry = "SELECT * FROM user_message ORDER BY id DESC";
  },
};
