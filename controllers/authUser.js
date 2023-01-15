const pool = require("../models/dbConnect");
const session = require("express-session");
const path = require("path");

module.exports = {
  post: (req, res) => {
    // console.log(req.body.userName);
    // console.log(req.body.user_pwd);

    var usermobno = req.body.userName;
    var pwd = req.body.user_pwd;
    var roleName = [];
    // var sql = "INSERT INTO user_message (title,message,expDate,schDate,category) VALUES ?";
    var sql = `Select * from user_details where user_mobno = ? and user_pwd = ?`;
    var sql1 = `select role_name from role_master where role_id = ?`;
    pool.query(sql, [usermobno, pwd], (err, result) => {
      // console.log(result);
      if (err) res.send(err);
      if (result.length >= 1) {
        // req.session.usermobno = usermobno;
        // console.log(result[0].user_id);
        var session = req.session;
        session.userid = req.body.userName;
        session.senderid = result[0].user_id; //this is for senderId of the user who sends the notification
        var userRoleId = result[0].user_role_id;
        
        pool.query(sql1, [userRoleId], (err, result) => {
          if (err) throw err;
          else {
            var userRole = JSON.parse(JSON.stringify(result))
            roleName =  [userRole[0].role_name]
          }
        });
        // var Path = path.join(__dirname, "..", "views", "index.html");
        console.log(roleName);
        console.log(req.session);
        res.redirect("/dashboard");
      } else {
        req.flash("Emsg", "Invalid Credentials");
        res.redirect("/");
      }
    });
  },
};
