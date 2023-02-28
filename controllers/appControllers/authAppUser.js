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
      // console.log("idhar");
      return res.status(400).json({ data: null, success: "false", message: 'Username and password are required.' });
    }


    const qry = `SELECT * FROM cluedin.user_details where user_mobno ="${usermobno}";`;

    pool.query(qry, (err, result) => {
      console.log(qry);
      // console.log(result);
      if (err) res.send(err);
      if (result.length === 0) {
        // console.log("idhar 2");
        return res.status(401).json({ data: null, success: "false", msg: 'Invalid username or password.' });
      }

      // Check if the password is correct

      const user = result[0];
      console.log(user);
      if (user.user_pwd !== password) {
        // console.log("idhar 3");
        return res.status(401).json({ data: null, success: "false", msg: 'Invalid username or password.' });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      return res.status(200).json({ data: { token }, success: "true", msg: 'User has been authenticated successfully.' });

    });
  },
};