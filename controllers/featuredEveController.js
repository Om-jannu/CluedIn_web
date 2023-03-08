const pool = require("../models/dbConnect");
const path = require("path");
const { json } = require("body-parser");

var Path = path.join(__dirname, "..", "views", "featured_eve");

module.exports = {
  get: (req, res) => {
    console.log("-----------------------Inside featured Events Page(/featuredEve)----------------------");
    var session = req.session;
    if (session.userid != null) {
      qry = `SELECT sb_id,sb_name FROM student_bodies_master`
      pool.query(qry, (err, result) => {
        if (err) throw err;
        res.render(Path, {
          userName: session.user_name,
          ProfileUrl: session.userProfileUrl,
          event_organiser: JSON.parse(JSON.stringify(result)),
          success: req.flash('success'),
          error: req.flash("error")
        });
      })
    } else res.redirect("/");
  },
  post: (req, res) => {
    console.log("--------------------------inside post method of /postFeaturedEve route--------------------------")
    var session = req.session;
    let { feat_event_title, feat_event_oraganiser, feat_event_redirectUrl } = req.body;
    // let values = [[feat_event_title,imgurl,feat_event_redirectUrl,feat_event_oraganiser,session.userid,todaysDate,1]];
    console.log(feat_event_title, feat_event_oraganiser, feat_event_redirectUrl);
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };

    const now = new Date();
    const indianDate = now.toLocaleDateString('en-IN', options);

    console.log(indianDate);
    ;
    let imgurl = null;
    if (req.file) {
      console.log("reqfile ", req.file);
      imgurl = path.join("feat_event_images/" + req.file.filename);
      console.log(imgurl);
    }
    let qry1 = `select count(isFeatured) as featured_count from featured_events where isFeatured = 1;`;
    pool.query(qry1, (err, result) => {
      if (err) throw err;
      let data = JSON.parse(JSON.stringify(result));
      console.log("qr1" + data);
      let qry2 = `insert into featured_events (
        feat_event_name,
        feat_event_imgUrl,
        feat_event_redirectUrl,
        feat_event_organizedBy,
        feat_event_sender_id,
        dateOfCreation,
        isFeatured
        ) values ?`;
      values = [feat_event_title, imgurl, feat_event_redirectUrl, feat_event_oraganiser, session.senderid, indianDate, 1]
      if (data[0].featured_count < 5) {
        pool.query(qry2, [[values]], (error, result) => {
          if (error) throw error;
          req.flash("success", "Event successfully added");
          res.redirect('/featuredEvent');
          console.log("qr2" + result);
        })
      } else {
        req.flash("error", "Max Capacity reached please remove an entry");
        res.redirect('/featuredEvent');
      }
    })


  },
  list: (req, res) => {
    console.log("------------------inside list feat event------------ ");

  }
}
