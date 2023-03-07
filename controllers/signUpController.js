
const path = require("path");
const pool = require("../models/dbConnect");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const client_secret = require('../client_secret_474604492516-d44810u318r3hnfhoiktiqneagrfi335.apps.googleusercontent.com (1).json');
const { link } = require("fs");
module.exports = {
  get: (req, res) => {
    console.log("--------------------------Inside signup(/signup)-------------------------");
    var session = req.session;
    var Path = path.join(__dirname, "..", "views", "signUp");
    res.render(Path, { err: req.flash("err"), success: req.flash("success") });
  },

  post: async (req, res) => {
    let email = req.body.userEmail;
    let get_user_details_from_email_qry = `SELECT * FROM cluedin.user_details where user_email='${email}';`

    const oauth2Client = new OAuth2(
      client_secret.web.client_id,
      client_secret.web.client_secret,
      client_secret.web.redirect_uris // Redirect URL
    );
    oauth2Client.setCredentials({
      refresh_token: client_secret.web.refresh_token
    });
    const accessToken = oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'cluedin.dbit@gmail.com',
        clientId: client_secret.web.client_id,
        clientSecret: client_secret.web.client_secret,
        refreshToken: client_secret.web.refresh_token,
        accessToken: accessToken
      }
    });
    const sendMail = (email, link) => {
      transporter.sendMail(
        {
          from: '"CluedIn" <cluedin.dbit@gmail.com>', // sender address
          to: email, // list of receivers
          subject: "CluedIn | RESET YOUR PASSWORD", // Subject line
          html: `
                  <h4>Here is your one time link to reset your password <a href="${link}">Reset Link</a></h4>
                  <p>This link is valid only for 5 minutes. Please do not forward this email to others to prevent anybody else from accessing your account.</p>
                  <br>
                  <h4>Regards, Team CluedIn</h4>
                `, // html body
        }, (error, info) => {
          if (error) {
            req.flash("err", "Email not found");
            res.redirect('/signup');
          } else {
            console.log('Email sent: ' + info.response);
          }
        }
      );
      console.log(`mail send to ${email}`);
    }
    pool.query(get_user_details_from_email_qry, (err, result) => {
      if (err) {
        throw err;
      }
      else if (result.length == 0) {
        req.flash("err", "Email not found");
        res.redirect('/signup');
      }
      else {
        try {
          let data = JSON.parse(JSON.stringify(result));
          let secret = process.env.JWT_SECRET + data[0].dateOfCreation;
          console.log(secret + "  :signup secret");
          let payload = {
            email: data[0].user_email,
            id: data[0].user_id
          }
          let token = jwt.sign(payload, secret, { expiresIn: '5m' });
          let link = `http://cluedin.creast.in:5000/reset-password/${data[0].user_id}/${token}`; //cluedin link
          let link2 = `http://localhost:5000/reset-password/${data[0].user_id}/${token}`; //localshost link
          console.log(link);
          sendMail(email, link);
          req.flash('success', `Email sent to ${email}`);
          res.redirect('/signup');
        } catch (error) {
          req.flash("err", error);
          res.redirect('/signup');
        }
      }
    })
  },
  // otp : (req,res)=>{
  //   console.log("--------------------------Inside signupotp(/signupotp)-------------------------");
  //   var session = req.session;
  //   var signUpOtpPage = path.join(__dirname, "..", "views", "signupOtp");
  //   const otp = otpGenerator.generate(6,{upperCaseAlphabets: false,
  //     specialChars: false,digits:true});

  //   console.log(otp);
  //   res.render(signUpOtpPage);
  // }
};
