const pool = require("../models/dbConnect");
const session = require("express-session");
const path = require("path");
const bcrypt = require('bcrypt');
module.exports = {
  post: (req, res) => {
    console.log("================================Login Authentication (post req)=================================");
    var usermobno = req.body.userName;
    var pwd = req.body.user_pwd;
    let notAllowedRole = 14;
    var sq0 = `Select * from user_details where user_mobno = ? and isDelete = 0 and  isDisabled =0`;
    var sql1 = `Select * from user_details where user_mobno = ? and user_pwd = ? and user_role_id not in (?)`;
    var sql2 = `select role_name from role_master where role_id = ?`;
    pool.query(sq0, [usermobno], (err, result) => {
      // console.log(result);
      if (err) console.log(err);;
      if (result.length >= 1) {
        bcrypt.compare(pwd, result[0].user_pwd, function (err, isMatch) {
          if (err) {
            console.error(err);
            res.send({
              success: false,
              message: 'Error occurred while comparing passwords'
            });
          } else if (!isMatch) {
            req.flash("Emsg", "Invalid Credentials");
            res.redirect("/");
          } else {
            var session = req.session;
            session.userid = req.body.userName;
            session.senderid = result[0].user_id; //this is for senderId of the user who sends the notification
            var userRoleId = result[0].user_role_id;
            session.userRoleId = userRoleId;
            session.user_name = result[0].user_fname + "" + result[0].user_lname  //updating the session stored values after the changes made in profile page 
            session.userProfileUrl = result[0].user_profilePic;//updating the session stored values after the changes made in profile page
            console.log("===================Session===========================\n", req.session);
            res.redirect("/dashboard");
          }
        });
      }
      else {
        req.flash("Emsg", "User Does Not exists");
        res.redirect("/");
      }
    });
  },
};





// pool.query(sql1, [usermobno, pwd, notAllowedRole], (err, result) => {
//   if (result.length >= 1) {
//     var session = req.session;
//     session.userid = req.body.userName;
//     session.senderid = result[0].user_id; //this is for senderId of the user who sends the notification
//     var userRoleId = result[0].user_role_id;
//     session.userRoleId = userRoleId;
//     session.user_name = result[0].user_fname + "" + result[0].user_lname  //updating the session stored values after the changes made in profile page
//     session.userProfileUrl = result[0].user_profilePic;//updating the session stored values after the changes made in profile page
//     console.log("===================Session===========================\n", req.session);
//     res.redirect("/dashboard");
//   } else {
//     req.flash("Emsg", "Unauthorised");
//     res.redirect("/");
//   }
// })