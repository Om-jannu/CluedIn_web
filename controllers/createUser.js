const pool = require("../models/dbConnect");
var flash = require("connect-flash");
const session = require("express-session");
const bcrypt = require('bcrypt');
module.exports = {
  get: function (request, response) {
    // console.log('create user')
    try {
      console.log("================Create user page========================");
      let session = request.session;

      if (session.userid) {
        //for dropdown options of bulk creation
        qry = `SELECT ay_id,ay_name FROM academicyear_master;SELECT bsd_id,bsd_value FROM BranchStd_Div_Mapping;`;
        pool.query(qry, (err, result) => {
          if (err) {
            throw err;
          }
          var data = JSON.parse(JSON.stringify(result));
          var ay = data[0];
          var bsd = data[1];
          // console.log(ay);
          //rendering createuser page
          response.render("createUser", {
            message: request.flash("message"),
            Bulk_errMsg: request.flash("err_message"),
            Bulk_successMsg: request.flash("success_message"),
            ay: ay,
            bsd_data: bsd,
            userName: session.user_name,
            ProfileUrl: session.userProfileUrl,
            userRole:session.userRoleId
          });
        });
      } else {
        var Path = path.join(__dirname, "..", "views", "login");
        // console.log("path to createuser:",Path);
        response.redirect("/");
      }
    } catch (error) {
      console.log(error);
    }
  },
  post: async (req, res) => {
    // fetching details
    // res.render("views/createUser");
    // console.log(req.body);

    var user_fname = req.body.user_fname;
    var user_lname = req.body.user_lname;
    var user_mobno = req.body.user_mobno;
    var user_pwd = req.body.user_pwd;
    var user_role = req.body.user_role;
    var user_dept = req.body.user_dept;
    var user_gender = req.body.user_gender;
    var user_email = req.body.user_email;
    var user_addr = req.body.user_addr;
    var user_pincode = req.body.user_pincode;

    try {
      // Generate salt
      const salt = await bcrypt.genSalt(10);

      // Hash password with salt
      const hashedPassword = await bcrypt.hash(user_pwd, salt);

      // Store username and hashed password in database
      // const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
      var sql =
        "INSERT INTO user_details (user_fname,user_lname,user_gender,user_email,user_mobno,user_addr,user_pincode,user_pwd,user_role_id,user_department) VALUES ?";
      // const values = [username, hashedPassword];
      var values = [
        [
          user_fname,
          user_lname,
          user_gender,
          user_email,
          user_mobno,
          user_addr,
          user_pincode,
          hashedPassword,
          user_role,
          user_dept,
        ],
      ];

      pool.query(sql, [values], (err, result) => {
        if (err) console.log(err);
        console.log("data inserted into user_details finally!!!");
        req.flash("message", "User created Successfully");
        res.redirect("/createuser");
      });
    } catch (error) {
      console.error('Error occurred during sign up:', error);
      throw new Error('Could not sign up');
    }
  },
};
