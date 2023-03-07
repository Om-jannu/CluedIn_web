const pool = require("../../models/dbConnect");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json);
const jwt = require('jsonwebtoken');
const { use } = require("../importExcelController");

module.exports = {
  post: (req, res) => {
    console.log("================= Login route from app =======================");
    // console.log(req.body);
    var usermobno = req.body.usermobno;
    var password = req.body.password;

    // Check if username and password are provided
    if (!usermobno || !password) {
      console.log("idhar");
      return res.status(400).json({ data: null, success: "false", message: 'Username and password are required.' });
    }


    const qry = `SELECT t1.* , t2.branch_name FROM cluedin.user_details t1 , branch t2 WHERE user_mobno = "${usermobno}" and t1.user_department=t2.branch_id`;
    // const qry1 = `SELECT t1.user_fname,t1.user_lname,t1.user_mobno,t1.user_pwd,t1.user_email,t2.branch_name , t1.user_profilePic from user_details t1 , branch t2 where t1.user_mobno="${mobno}" and t1.user_department=t2.branch_id;`
    pool.query(qry, (err, result) => {
      // console.log(qry);
      if (err) {
        console.log(err);
        return res.status(500).json({ data: null, success: false, message: 'Internal server error.' });
      }
      if (result.length === 0) {
        return res.status(401).json({ data: null, success: false, message: "The user doesn't exist. Please Signup to continue" });
      }

      // Check if the password is correct

      const user = result[0];
      // console.log(user);
      if (user.user_pwd !== password) {
        return res.status(401).json({ data: null, success: "false", msg: 'Invalid username or password.' });
      }
      const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET);
      console.log("jwt token",token);

      // Store the token in the server's database for single user login
      const updateTokenQuery = `UPDATE cluedin.user_details SET user_token = "${token}" WHERE user_mobno = "${user.user_mobno}";`;
      pool.query(updateTokenQuery, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ data: null, success: false, message: 'Internal server error.' });
        }
        // console.log(`Token has been stored in the database for user ${usermobno}`);
      });
      //local variables to store profile data 
      let user_id = user.user_id;
      let user_fname = user.user_fname;
      let user_lname = user.user_lname;
      let user_mobno = user.user_mobno;
      let user_email = user.user_email;
      let user_branch = user.branch_name;
      let user_profilePic = user.user_profilePic;
      // console.log(user_email);
      return res.status(200).json(
        {
          data:
          {
            user_id,
            user_fname,
            user_lname,
            user_mobno,
            user_email,
            user_branch,
            user_profilePic,
            token
          },
          success: "true",
          msg: 'User has been authenticated successfully.'
        });

    });
  },

};