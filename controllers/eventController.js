const pool = require("../models/dbConnect");
const path = require("path");
const session = require("express-session");

const firebaseAdmin = require("firebase-admin");
const { credential } = require("firebase-admin");
const serviceAccount = require("../cluedin-db185-firebase-adminsdk-g30hi-5e023ee3ab.json");
var flash = require("connect-flash");
const { patch } = require("./importExcelController");


var Path = path.join(__dirname, "..", "views", "events");

module.exports = {
  get: (req, res) => {
    var session = req.session;
    if (session.userid != null) {
      qry = `SELECT el_id,el_name FROM events_label_master;SELECT sb_id,sb_name FROM student_bodies_master`
      pool.query(qry,(err,result)=>{
        if (err) throw err;
        var data = JSON.parse(JSON.stringify(result));
        console.log("event  data:",data);
        var label = data[0];
        var organiser = data[1];
        console.log("1",organiser);
        res.render(Path, {
          userName: session.user_name,
          ProfileUrl: session.userProfileUrl,
          event_organiser: organiser,
          event_label : label,    
        });
      })
      
    } else res.redirect("/");
  },
  post: (req,res)=>{
    console.log("reached here")
    var session = req.session;
    let event_title = req.body.event_title;
    let event_desc  = req.body.event_desc;
    let scheduled_date = req.body.scheduled_date;
    let expiry_date = req.body.expiry_date;
    let organiser = req.body.oraganiser;
    let event_label = req.body.event_label;
    let event_fees = req.body.event_fees; 
    let event_img = req.body.event_img;
    let event_attachment = req.body.event_attachment;
    let event_reg_url = req.body.event_reg_url;
    console.log(req.body);
    // enctype="multipart/form-data"
  }
};
