const pool = require("../models/dbConnect");
const path = require("path");
const session = require("express-session");

const firebaseAdmin = require("firebase-admin");
const { credential } = require("firebase-admin");
const serviceAccount = require("../cluedin-db185-firebase-adminsdk-g30hi-5e023ee3ab.json");
var flash = require("connect-flash");
const { patch } = require("./importExcelController");
const { query } = require("express");


var Path = path.join(__dirname, "..", "views", "events");

module.exports = {
  get: (req, res) => {
    console.log("-----------------------Inside Events Page(/event)----------------------");
    const session = req.session;
    if (session.userid != null && (session.userRoleId === 1 || session.userRoleId === 4  || session.userRoleId === 13 || session.userRoleId === 10 || session.userRoleId === 11))  {
      qry = `SELECT el_id,el_name FROM events_label_master;SELECT sb_id,sb_name FROM student_bodies_master`
      try {
        pool.query(qry, (err, result) => {
          if (err) throw err;
          var data = JSON.parse(JSON.stringify(result));
          // console.log("event  data:",data);
          var label = data[0];
          var organiser = data[1];
          // console.log("1",organiser);
          res.render(Path, {
            userName: session.user_name,
            ProfileUrl: session.userProfileUrl,
            event_organiser: organiser,
            event_label: label,
            eventMsg: req.flash('eventMsg'),
            userRole:session.userRoleId,
            roleName:session.userRole
          });
        })
      } catch (error) {
        console.error(error);
      }
    } else res.redirect("/");
  },
  post: (req, res) => {
    console.log("--------------------------inside post method of /postevent route--------------------------")
    var session = req.session;
    let event_title = req.body.event_title;
    let event_desc = req.body.event_desc;
    let event_notif_desc = req.body.event_notif_desc;
    let scheduled_date = req.body.scheduled_date;
    let expiry_date = req.body.expiry_date;
    let organiser = req.body.oraganiser;
    let event_label = req.body.event_label;
    let event_fees = req.body.event_fees;
    let event_img = req.body.event_img;
    let event_attachment = req.body.event_attachment;
    let event_reg_url = req.body.event_reg_url;
    // console.log(req.body.event_title);
    let getFcmTokensSql = [];


    let qry = `INSERT INTO events 
    (
      sender_id,
      organiser_id,
      event_label_id,
      event_title,
      event_desc,
      event_notif_desc,
      event_image_url,
      event_attachment_url,
      event_registration_url,
      event_fees,
      dateOfSchedule,
      dateOfExpiration
    )
    VALUES ?`
    let values = [[session.senderid, organiser, event_label, event_title, event_desc, event_notif_desc, event_img, event_attachment, event_reg_url, event_fees, scheduled_date, expiry_date]]
    pool.query(qry, [values], (err, result) => {
      if (err) throw err;
      console.log("Data inserted into events table");
      var sql_1 =
        "select t1.firebase_token from user_details t1, Student_branch_standard_div_ay_rollno_sem_mapping t2 WHERE t2.user_id = t1.user_id and t2.ay_id=2 and t2.isDisabled=0 and t2.isDelete=0;"
      pool.query(sql_1, (err, result) => {
        if (err) throw err;

        var token = JSON.parse(JSON.stringify(result));
        for (let i = 0; i < token.length; i++) {
          getFcmTokensSql.push(token[i].firebase_token);
          // console.log("---------------------\nfbtoken:", getFcmTokensSql);
        }
        console.log("FB TOKEN:", getFcmTokensSql);
      })
    })
    req.flash("eventMsg", "Event Created");
    res.redirect("/event")
  }
};
