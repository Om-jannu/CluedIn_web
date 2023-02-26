const pool = require("../models/dbConnect");
const path = require("path");
const session = require("express-session");

module.exports = {
  get: (req, res) => {
    var Path = path.join(__dirname, "..", "views", "events");
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
};
