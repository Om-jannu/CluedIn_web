const pool = require("../models/dbConnect");
const session = require("express-session");
const path = require("path");

module.exports = {
  post: (req, res) => {
    console.log("================================Login Authentication (post req)=================================");
    var usermobno = req.body.userName;
    var pwd = req.body.user_pwd;
   
    var sql = `Select * from user_details where user_mobno = ? and user_pwd = ?`;
    var sql1 = `select role_name from role_master where role_id = ?`;
    pool.query(sql, [usermobno, pwd], (err, result) => {
      // console.log(result);
      if (err) res.send(err);
      if (result.length >= 1) {

        var session = req.session;
        session.userid = req.body.userName;
        session.senderid = result[0].user_id; //this is for senderId of the user who sends the notification
        var userRoleId = result[0].user_role_id;
        session.user_name = result[0].user_fname+" "+result[0].user_lname  //updating the session stored values after the changes made in profile page 
        session.userProfileUrl = result[0].user_profilePic;//updating the session stored values after the changes made in profile page
        // console.log("username:"+user_name);
        pool.query(sql1, [userRoleId], (err, result) => {
          if (err) throw err;
          else {
            var userRole = JSON.parse(JSON.stringify(result))
            // var roleName =  [userRole[0].role_name]
            console.log(userRole);
          }
        });

        console.log("===================Session===========================\n",req.session);
        res.redirect("/dashboard");
      } else {
        req.flash("Emsg", "Invalid Credentials");
        res.redirect("/");  
      }
    });
  },
};
