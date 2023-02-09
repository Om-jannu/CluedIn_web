const pool = require("../models/dbConnect");
const path = require("path");
const session = require("express-session");

module.exports = {
  get: (req, res) => {
    var session = req.session;

    let sql = `select t1.user_fname ,t1.user_lname, t1.user_gender ,t1.user_email, t1.user_mobno ,t1.user_addr, t1.user_pincode ,t2.role_name, t3.branch_name , t1.user_profilePic from user_details t1 ,role_master t2 , branch t3 where t1.user_role_id = t2.role_id and t1.user_department = t3.branch_id and t1.user_mobno = "${session.userid}"`;

    pool.query(sql,(err, data) => {
        if (err) throw err;
        let profileData = JSON.parse(JSON.stringify(data));
        console.log(profileData[0]);


        if (session.userid != null) {
            var Path = path.join(__dirname, "..", "views", "profile");
            res.render(Path ,{profileData:profileData[0]});
          } else res.redirect("/");
      });
  },

  edit:(req,res) =>{
    var session = req.session;
    var user_fname = req.body.user_fname;
    var user_lname = req.body.user_lname;
    var user_addr = req.body.user_addr;
    var qry = `UPDATE user_details SET user_fname ="${user_fname}" ,user_lname ="${user_lname}",user_addr = "${user_addr}" where user_mobno = "${session.userid}"`;

    pool.query(qry ,(err, data) => {
      if (err) throw err;
      console.log("profile updated successfully");
      res.redirect("/profile");
    });
  },

  updateProfile:(req,res)=>{
    var session = req.session;
    var server_url = "http://128.199.23.207:5000/profile/"
    profileUrl = path.join(server_url,req.file.filename);
    console.log("imgUrl:",profileUrl);
    qry = `Update user_details SET user_profilePic = "${profileUrl}" where user_mobno = "${session.userid}"`
    pool.query(qry,(err,result)=>{
      if (err) throw err;
      res.redirect('/profile');
    })
  }
};
