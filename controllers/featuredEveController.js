const pool = require("../models/dbConnect");
const path = require("path");

var Path = path.join(__dirname, "..", "views", "featured_eve");

module.exports = {
  get: (req, res) => {
    console.log("-----------------------Inside featured Events Page(/featuredEve)----------------------");
    var session = req.session;
    if (session.userid != null) {
      qry = `SELECT sb_name FROM student_bodies_master`
      pool.query(qry,(err,result)=>{
        if (err) throw err;
        res.render(Path, {
          userName: session.user_name,
          ProfileUrl: session.userProfileUrl,
          event_organiser: JSON.parse(JSON.stringify(result)),
          feaEventMsg : req.flash('feaEventMsg')    
        });
      })
    } else res.redirect("/");
  },
  post: (req,res)=>{
    console.log("--------------------------inside post method of /postFeaturedEve route--------------------------")
    var session = req.session;
    let {event_title,event_img,event_reg_url,event_organiser} = req.body;
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
    let values = [[session.senderid,organiser,event_label,event_title,event_desc,event_notif_desc,event_img,event_attachment,event_reg_url,event_fees,scheduled_date,expiry_date]]
    pool.query(qry,[values],(err,result)=>{
      if (err) throw err;
      console.log("Data inserted into events table");
      var sql_1 =
      "select t1.firebase_token from user_details t1, Student_branch_standard_div_ay_rollno_sem_mapping t2 WHERE t2.user_id = t1.user_id and t2.ay_id=2 and t2.isDisabled=0 and t2.isDelete=0;"
      pool.query(sql_1,(err,result)=>{
        if (err) throw err ;

        var token = JSON.parse(JSON.stringify(result));
        for (let i = 0; i < token.length; i++) {
          getFcmTokensSql.push(token[i].firebase_token);
          // console.log("---------------------\nfbtoken:", getFcmTokensSql);
        }
        console.log("FB TOKEN:",getFcmTokensSql);
      })
    })
    req.flash("eventMsg", "Event Created");
    res.redirect("/event")
  }
};
