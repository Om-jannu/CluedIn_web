const pool = require("../models/dbConnect");
const firebaseAdmin = require("firebase-admin");
const { credential } = require("firebase-admin");
const serviceAccount = require("../cluedin-db185-firebase-adminsdk-g30hi-5e023ee3ab.json");
var flash = require("connect-flash");
const { patch } = require("./importExcelController");
const path = require("path");
module.exports = {
  post: async (req, res) => {
    console.log("--------------------------Inside post method of send notif form(/sendNotif)------------------------------");

    var session = req.session;

    var notif_title = req.body.notif_title;
    var notif_desc = req.body.notif_desc;
    var exp_date = req.body.exp_date;
    var scheduled_date = req.body.scheduled_date;
    var label = req.body.label;
    var target_class = []; 
    target_class.push(req.body.target_class);
    let targetClass = `(${target_class.join(" ',' ")})`;
    console.log("bsd", targetClass);
    var gender = req.body.user_gender;
    let TARGETCLASS = req.body.target_class;
    console.log("class",TARGETCLASS);
    let imgurl = null;
    if (req.files) {
      console.log("req.file ",req.files);
      imgurl = path.join(
        "http://128.199.23.207:5000/images/" + req.files['notif-img'][0].filename
      );
      attachment_url = path.join(
        "http://128.199.23.207:5000/file/" + req.files['notif-attachment'][0].filename
      );
    }
    // TODO send only file name

    console.log("imgUrl:", imgurl,"\nattachmentUrl:", attachment_url);

    var sql =
      "INSERT INTO notification_message (nm_title,sender_id,nm_message,nm_image_url,nm_label_id, targetClass) VALUES ?";
    var values = [[notif_title, session.senderid, notif_desc, imgurl, label, targetClass]];

    pool.query(sql, [values], (err, result) => {
      if (err) throw err;

      let nm_id = result.insertId;
      console.log("data inserted into notification table");


      //fcm token array 
      var getFcmTokensSql = [];

      //logic for getting selected fcm tokens

      var target_gender = gender;
      var params = {};

      if (target_gender != 0) {
        params.target_gender = target_gender;
      }

      // console.log(params);

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

      // console.log(sql_1);
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
        //firebase notif logic
        const payload = {
          notification: {
            title: req.body.notif_title,
            body: req.body.notif_desc,
            sound: "default",
            imageUrl:
              "https://techcommunity.microsoft.com/t5/image/serverpage/image-id/366577i4F851B60F8347ED4",
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            screen: "HomePage",
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
        // firebaseAdmin.messaging().sendToDevice(getFcmTokensSql, payload, options);
        getFcmTokensSql = [];
        // console.log("---------------------\nfbtoken after :",getFcmTokensSql);


        //-----------------------------------------logic for inserting into targetlist table ------------------------------------------


        function generateValuesArray(value1, value2Array, value3) {
          const valuesArray = [];
          value2Array.forEach(function (value2) {
            const rowArray = [value1, value2, value3];
            valuesArray.push(rowArray);
          });
          return valuesArray;
        }
        // query for notification_message_targetlist
        let bsd_arr
        // console.log("tarrrrgett ",target_class);
        if (TARGETCLASS.length == 1) {
          bsd_arr = [req.body.target_class]
        }
        else bsd_arr = req.body.target_class
        qry = `INSERT INTO notification_message_targetlist (nm_id,bsd_id,nm_gender) values ?`;
        const valuesArray = generateValuesArray(nm_id, bsd_arr, gender);


        // console.log(bsd_arr);

        console.log("val:", valuesArray);

        pool.query(qry, [valuesArray], (err, result) => {
          if (err) throw err;
          console.log("inserted into notif target table")

          //querybuilder funtion
          function buildConditions1(params) {
            let conditions = [];
            let values = [];
            let conditionsStr;

            if (typeof params.target_gender !== "undefined") {
              conditions.push("t2.user_gender = ?");
              values.push(parseInt(params.target_gender));
            }

            if (1) {
              conditions.push(
                `bsd_id in ${targetClass} and t1.user_id=t2.user_id and t1.isDisabled=0 and t1.isDelete=0;`
                // `t2.user_id = t1.user_id and t2.ay_id=2 and t2.bsd_id IN ${targetClass} and t2.isDisabled=0 and t2.isDelete=0;`
              );
              // values.push(parseInt(params.target_gender));
            }

            return {
              where: conditions.length ? conditions.join(" AND ") : "1",
              values: values,
            };
          }

          var conditions1 = buildConditions1(params);

          // let qry1 = `select user_id from Student_branch_standard_div_ay_rollno_sem_mapping where bsd_id in ${targetClass} `
          let queryy = `select t1.user_id from Student_branch_standard_div_ay_rollno_sem_mapping t1,user_details t2 where  ` + conditions1.where
          console.log("qryyyyy:", queryy);
          pool.query(queryy, conditions1.values, (err, result) => {
            if (err) throw err;
            let data = JSON.parse(JSON.stringify(result))


            //to append user_id into array 
            let targetUserId = [];
            for (let index = 0; index < data.length; index++) {
              targetUserId.push(data[index].user_id);
            }
            console.log("target users", targetUserId);

            //logic to insert data into target users table 
            const values = generateValuesArray(nm_id, targetUserId, 0); //0 is for isRead i.e notif is not read by user 
            console.log("status table:", values);
            qry2 = `Insert into cluedin.user_notification_status (nm_id,user_id,isRead) values ? ;`
            if (targetUserId.length != 0) {
              pool.query(qry2, [values], (err, result) => {
                if (err) throw err;
                console.log("Data inserted into notification status table");
              })
            }
            else console.log("no users to insert in status table");
          })

          // generateValuesArray
        });
        req.flash("message1", "Notification Sent ");
        res.redirect("/dashboard");
      });
    });
  },
};
