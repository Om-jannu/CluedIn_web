const pool = require("../../models/dbConnect");
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json);
const jwt = require('jsonwebtoken');

module.exports = {
  post: (req, res) => {
    console.log("================= Login route from app =======================");

    var usermobno = req.body.usermobno;
    var password = req.body.password;

    // Check if username and password are provided
    if (!usermobno || !password) {
      console.log("idhar");
      return res.status(400).json({ data: null, success: "false", message: 'Username and password are required.' });
    }


    const qry = `SELECT * FROM cluedin.user_details WHERE user_mobno = "${usermobno}"`;

    pool.query(qry, (err, result) => {
      console.log(qry);
      if (err) {
        console.log(err);
        return res.status(500).json({ data: null, success: false, message: 'Internal server error.' });
      }
      if (result.length === 0) {
        return res.status(401).json({ data: null, success: false, message: "The user doesn't exist. Please Signup to continue" });
      }

      // Check if the password is correct

      const user = result[0];
      console.log(user);
      if (user.user_pwd !== password) {
        return res.status(401).json({ data: null, success: "false", msg: 'Invalid username or password.' });
      }
      const token = jwt.sign({ id: user.user_mobno }, process.env.JWT_SECRET);

      // Store the token in the server's database for single user login
      const updateTokenQuery = `UPDATE cluedin.user_details SET user_token = "${token}" WHERE user_mobno = "${user.user_mobno}";`;
      pool.query(updateTokenQuery, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ data: null, success: false, message: 'Internal server error.' });
        }
        console.log(`Token has been stored in the database for user ${usermobno}`);
      });

      return res.status(200).json({ data: { token }, success: "true", msg: 'User has been authenticated successfully.' });

    });
  },

};