const pool = require("../models/dbConnect");
const firebaseAdmin = require("firebase-admin");
const { credential } = require("firebase-admin");
const serviceAccount = require("../cluedin-db185-firebase-adminsdk-g30hi-5e023ee3ab.json");
var flash = require("connect-flash");

module.exports = {
  post: async (req, res) => {
    // fetching details
    // console.log(req.body);
    // firebaseAdmin.initializeApp({
    //   credential: firebaseAdmin.credential.cert(serviceAccount),
    // });
    var session = req.session;

    var notif_title = req.body.notif_title;
    // console.log(notif_title);
    var notif_desc = req.body.notif_desc;
    var exp_date = req.body.exp_date;
    var scheduled_date = req.body.scheduled_date;
    var category = req.body.category;
    var label = req.body.label;
    var target_class = [];
    target_class.push(req.body.target_class);
    let targetClass = `('${target_class.join("','")}')`;
    console.log("bsd", targetClass);
    var gender = req.body.user_gender;

    // var sql = "INSERT INTO user_message (title,message,expDate,schDate,category) VALUES ?";
    console.log("sessionid", session.userid);
    var sql =
      "INSERT INTO notification_message (nm_title,sender_id,nm_message,nm_label_id) VALUES ?";
    var values = [[notif_title, session.senderid, notif_desc, label]];
    pool.query(sql, [values], (err, result) => {
      if (err) throw err;

      // res.send("notif sent");
      console.log("data inserted finally!!!");
    });
    //fcm token array
    var getFcmTokensSql = [];
    //logic for getting selected fcm tokens

    var target_gender = gender;
    var params = {};

    if (target_gender != 0) {
      params.target_gender = target_gender;
    }

    console.log(params);

    function buildConditions(params) {
      var conditions = [];
      var values = [];
      var conditionsStr;

      if (typeof params.target_gender !== "undefined") {
        conditions.push("t1.user_gender = ?");
        values.push(parseInt(params.target_gender));
      }

      if (1) {
        conditions.push(
          `t2.user_id = t1.user_id and t2.ay_id=2 and t2.bsd_id IN ${targetClass} and t2.isDisabled=0 and t2.isDelete=0;`
        );
        // values.push(parseInt(params.target_gender));
      }

      return {
        where: conditions.length ? conditions.join(" AND ") : "1",
        values: values,
      };
    }

    var conditions = buildConditions(params);
    var sql_1 =
      "select t1.firebase_token from user_details t1, Student_branch_standard_div_ay_rollno_sem_mapping t2 WHERE " +
      conditions.where;

    console.log(sql_1);
    pool.query(sql_1, conditions.values, (err, result) => {
      if (err) console.log(err);

      // res.send("notif sent");
      var token = JSON.parse(JSON.stringify(result));
      // console.log(token[1].firebase_token);
      //to push the fb token in array
      for (let i = 0; i < token.length; i++) {
        getFcmTokensSql.push(token[i].firebase_token);
        // console.log("---------------------\nfbtoken:", getFcmTokensSql);
      }

      console.log("---------------------\nfinaltoken:", getFcmTokensSql);
      const payload = {
        notification: {
          title: req.body.notif_title,
          body: req.body.notif_desc,
          sound: "default",
          imageUrl:
            "https://techcommunity.microsoft.com/t5/image/serverpage/image-id/366577i4F851B60F8347ED4",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        data: {
          data1: "data1",
          data2: "data2",
        },
      };
      const options = {
        priority: "high",
        timeToLive: 60 * 60,
      };

      //below to be uncommented once the actual fcm tokens are generated and inserted into db
      firebaseAdmin.messaging().sendToDevice(getFcmTokensSql, payload, options);
      getFcmTokensSql = [];
      console.log("---------------------\nfbtoken after :",getFcmTokensSql);
      req.flash("message1", "Notification Sent ");

      //query for notification_message_targetlist
      // qry = `INSERT INTO notification_message_targetlist (nm_id,bsd_id,nm_gender) values ((SELECT nm_id from notification_message WHERE nm_title = "${notif_title}" ),"${target_class}","${gender}")`;
      // pool.query(qry,(err,result)=>{
      //   if (err) throw err;
      //   log("inserted into notif target table")
      // });
      res.redirect("/dashboard");
    });
  },
};
