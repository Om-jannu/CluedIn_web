const pool = require("../models/dbConnect");
const path = require("path");
const session = require("express-session");
const sharp = require("sharp");
const fs = require("fs");

module.exports = {
  get: (req, res) => {
    var session = req.session;

    let sql = `select t1.user_fname ,t1.user_lname, t1.user_gender ,t1.user_email, t1.user_mobno ,t1.user_addr, t1.user_pincode ,t2.role_name, t3.branch_name , t1.user_profilePic from user_details t1 ,role_master t2 , branch t3 where t1.user_role_id = t2.role_id and t1.user_department = t3.branch_id and t1.user_mobno = "${session.userid}"`;

    pool.query(sql, (err, data) => {
      if (err) throw err;
      let profileData = JSON.parse(JSON.stringify(data));
      console.log(profileData[0]);

      if (session.userid != null) {
        session.userProfileUrl = profileData[0].user_profilePic;
        session.user_name = profileData[0].user_fname+" "+profileData[0].user_lname
        console.log("userUrlSession: " + session.userProfileUrl);
        var Path = path.join(__dirname, "..", "views", "profile");
        res.render(Path, {
          profileData: profileData[0],
          userName: session.user_name,
          ProfileUrl: session.userProfileUrl,
        });
      } else res.redirect("/");
    });
  },

  edit: (req, res) => {
    var session = req.session;
    var user_fname = req.body.user_fname;
    var user_lname = req.body.user_lname;
    var user_addr = req.body.user_addr;
    var qry = `UPDATE user_details SET user_fname ="${user_fname}" ,user_lname ="${user_lname}",user_addr = "${user_addr}" where user_mobno = "${session.userid}"`;

    pool.query(qry, (err, data) => {
      if (err) throw err;
      console.log("profile updated successfully");
      res.redirect("/profile");
    });
  },

  updateProfile: (req, res) => {
    //resize
    var session = req.session;
    if (session.userid != null) {
      const originalName = req.file.filename;
      const resizedFilePath = path.join("uploads", "profilePic", originalName);
      sharp(req.file.path)
        .resize(512, 512)
        .toFile(resizedFilePath, (err, info) => {
          if (err) console.log(err);

          // Delete the original uploaded file using fs.unlink
          fs.unlink(req.file.path, (err) => {
            if (err) return res.status(500).send(err);
          });
          console.log("image resized ");
        });

      var server_url = "profile/";
      profileUrl = path.join(server_url, req.file.filename);
      console.log("imgUrl:", profileUrl);
      qry = `Update user_details SET user_profilePic = "${profileUrl}" where user_mobno = "${session.userid}"`;
      pool.query(qry, (err, result) => {
        if (err) throw err;
        res.redirect("/profile");
      });
    } else res.redirect("/");
  },
};
