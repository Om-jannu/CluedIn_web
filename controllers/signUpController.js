
const path = require("path");
const pool = require("../models/dbConnect");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
module.exports = {
  get: (req, res) => {
    console.log("--------------------------Inside signup(/signup)-------------------------");
    var session = req.session;
    var Path = path.join(__dirname, "..", "views", "signUp");
    res.render(Path,{err : req.flash("err"),success : req.flash("success")});
  },

  post: async(req,res) => {
    let email = req.body.userEmail;
    let get_user_details_from_email_qry = `SELECT * FROM cluedin.user_details where user_email='${email}';`

    // create reusable transporter object using the default SMTP transport
    // let transporter = nodemailer.createTransport({
    //   host: "smtp.ethereal.email",
    //   port: 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: 'gust19@ethereal.email', // generated ethereal user
    //     pass: '7subBuF3cV23q8p2WU', // generated ethereal password
    //   },
    // });
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: '320om0042@dbit.in',
          pass: 'soHlf@2641#'
      }
    });
    const sendMail = async(email,link) =>{
      let info = await transporter.sendMail({
        from: '"CluedIn 👻" <CluedIn@csi.com>', // sender address
        to: email, // list of receivers
        subject: "SET PASSWORD", // Subject line
        text: `This is the link to change your password : ${link}`, // plain text body
        html: `<a href="${link}">SET PASSWORD LINK</a>`, // html body
      });
      console.log(`mail send to ${email}`);
    }

    pool.query(get_user_details_from_email_qry,(err,result)=>{
      if(err) {
        throw err;
      }
      else if(result.length==0){
        req.flash("err", "Email not found");
        res.redirect('/signup');
      }
      else{
        let data = JSON.parse(JSON.stringify(result));
        let secret = process.env.JWT_SECRET + data[0].dateOfCreation; 
        console.log(secret+"  :signup secret");
        let payload = {
          email : data[0].user_email,
          id : data[0].user_id
        }
        let token = jwt.sign(payload,secret,{expiresIn:'5m'});
        let link = `http://localhost:5000/reset-password/${data[0].user_id}/${token}`
        console.log(link);
        sendMail(email,link);
        req.flash('success', `Email sent to ${email}`);
        res.redirect('/signup');
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
