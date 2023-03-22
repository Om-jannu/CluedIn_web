const pool = require("../models/dbConnect");
const firebaseAdmin = require("firebase-admin");
const { credential } = require("firebase-admin");
const serviceAccount = require("../cluedin-db185-firebase-adminsdk-g30hi-5e023ee3ab.json");
var flash = require("connect-flash");
const { patch } = require("./importExcelController");
const path = require("path");
var NotifPath = path.join(__dirname, "..", "views", "notification");
module.exports = {
  get: (req, res) => {
    console.log("-------------------------- Inside Notification page)------------------------------");
    const session = req.session;


    if (session.userid != null && session.userRoleId != 11 && session.userRoleId != 14) {   //available to all except sbc and student 
      // var Path = path.join(__dirname, "..", "views", "index");
      // res.render(Path,{message1 : req.flash('message1')});

      //dynamic data for dropdown in create notif form 
      if (session.userRoleId === 1 || session.userRoleId === 2 || session.userRoleId === 4 || session.userRoleId === 13 || session.userRoleId === 10 || session.userRoleId === 8 || session.userRoleId === 9) {
        qry = `SELECT label_id,label_name FROM label_master where isDisabled = 0 and isDelete = 0;
                SELECT bsd_id,bsd_value FROM BranchStd_Div_Mapping where isDisabled = 0 and isDelete = 0;`
      }
      else if (session.userRoleId === 3) {
        qry = `SELECT label_id,label_name FROM label_master where isDisabled = 0 and isDelete = 0;
        SELECT t1.bsd_id, t2.bsd_value FROM Role_BSD_Mapping t1,BranchStd_Div_Mapping t2 where t1.role_id = ? and t1.branch_id= ? and t1.bsd_id=t2.bsd_id and t1.isDelete=0;`
      }
      pool.query(qry,[session.userRoleId,session.userDept] ,(err, result) => {
        if (err) {
          throw err;
        }
        var data = JSON.parse(JSON.stringify(result));
        // console.log(data);
        var label = data[0];
        // console.log(label);
        var bsd = data[1];
        // res.render(Path,{branch_data:data});
        res.render(NotifPath, { message1: req.flash('message1'), err_message1: req.flash('err_message1'), label_data: label, bsd_data: bsd, userName: session.user_name, ProfileUrl: session.userProfileUrl, userRole: session.userRoleId });
      })

      // res.render();
    } else {
      // var Path = path.join(__dirname, "..", "views", "login");
      res.redirect('/');
    }


  },
  post: async (req, res) => {
    try {
      console.log("--------------------------Try   Inside post method of send notif form(/sendNotif)------------------------------");

      let session = req.session;
      if (session.userid != null) {
        console.log("inside session try");
        const date = new Date(new Date().toUTCString());
        var notif_title = req.body.notif_title;
        var notif_desc = req.body.notif_desc;
        var exp_date = req.body.exp_date;
        var scheduled_date = req.body.scheduled_date;
        console.log("scheduled_date", scheduled_date);
        var label = req.body.label;

        var target_class = req.body.target_class; //for notif target list
        //logic for all 
        let BsdDataArr = []
        if (target_class[0] == 0) {
          console.log("Selected class is ALL");
          const qry = `select bsd_id from BranchStd_Div_Mapping`
          const BsdDataPromise = new Promise((resolve, reject) => {
            pool.query(qry, (err, data) => {
              if (err) reject(err);
              else resolve(JSON.parse(JSON.stringify(data)));
            });
          });
          // use await to wait for BsdDataPromise to resolve
          const BsdData = await BsdDataPromise;
          target_class = [];
          for (let index = 0; index < BsdData.length; index++) {
            target_class.push(BsdData[index].bsd_id);
          }
          console.log("All data", target_class);
        }



        let targetClass = `(${target_class.join(" , ")})`; //for notif target list
        console.log("bsd", targetClass, "target_class", target_class);

        var gender = req.body.user_gender;
        let TARGETCLASS = req.body.target_class; //this is for user status table

        // console.log("class", TARGETCLASS);
        // logic to store img and attachment urls 
        let imgurl = req.files['notif-img'] ? "images/" + req.files['notif-img'][0].filename : null;
        let attachment_url = req.files['notif-attachment'] ? "file/" + req.files['notif-attachment'][0].filename : null;

        console.log("req.file ", req.files);

        console.log("imgUrl:", imgurl, "\nattachmentUrl:", attachment_url);
        // -----------------------------------------------------qry to check target users exists or not--------------------------------------------

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

        pool.query(sql_1, conditions.values, (err, result) => {
          if (err) console.log(err);

          // res.send("notif sent");
          var token = JSON.parse(JSON.stringify(result));

          if (!token.length) {
            console.log(`No FCM tokens found for target class: ${targetClass}`);
            // return res.status(400).send(`No FCM tokens found for target class: ${targetClass}`);
            req.flash("err_message1", "No Users in the selected class so can't send the Notification ");
            return res.redirect('/notification')
          }
          // console.log(token[1].firebase_token);
          //to push the fb token in array
          for (let i = 0; i < token.length; i++) {
            getFcmTokensSql.push(token[i].firebase_token);
            // console.log("---------------------\nfbtoken:", getFcmTokensSql);
          }

          console.log("---------------------\nfinaltoken:", getFcmTokensSql);
          //filtering null values from fcmtokenarray 
          getFcmTokensSql = getFcmTokensSql.filter((value) => value !== null);
          console.log("---------------------\nfinaltoken:(after removing null)", getFcmTokensSql.length);
          //firebase notif logic
          const payload = {
            notification: {
              title: req.body.notif_title,
              body: req.body.notif_desc,
              sound: "default",
              click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
            data: {
              screen: "notification",
            },
          };
          const options = {
            priority: "high",
            timeToLive: 60 * 60,
          };

          //below to be uncommented once the actual fcm tokens are generated and inserted into db
          if (getFcmTokensSql.length == 0) {
            req.flash("err_message1", "No user tokens found. Pls ask all the students of selected class to install the Mobile App");
            return res.redirect('/notification')
          }
          else {

            firebaseAdmin.messaging().sendToDevice(getFcmTokensSql, payload, options);
            getFcmTokensSql = [];
            // console.log("---------------------\nfbtoken after :",getFcmTokensSql);

            //---------------------------------------------------------------------------------------------------------------------------
            var sql1 =
              "INSERT INTO notification_message (nm_title,sender_id,nm_message,nm_image_url,nm_attachment_url,nm_label_id, targetClass,dateOfCreation) VALUES ?";
            var values = [[notif_title, session.senderid, notif_desc, imgurl, attachment_url, label, targetClass, date]];

            pool.query(sql1, [values], (err, result) => {
              if (err) throw err;

              let nm_id = result.insertId;
              console.log("data inserted into notification table");
              //-----------------------------------------logic for inserting into targetlist table ------------------------------------------


              function generateValuesArray(value1, value2Array, value3, value4) {
                const valuesArray = [];
                value2Array.forEach(function (value2) {
                  const rowArray = [value1, value2, value3, value4];
                  valuesArray.push(rowArray);
                });
                return valuesArray;
              }
              // query for notification_message_targetlist
              console.log("tarrrrgett len  ", target_class.length);
              let bsd_arr = target_class;

              console.log("bsd_arr", bsd_arr);
              if (bsd_arr[0] === 0) {
                console.log("this notification is for all users");
              }
              qry = `INSERT INTO notification_message_targetlist (nm_id,bsd_id,nm_gender,dateOfCreation) values ?`;
              const valuesArray = generateValuesArray(nm_id, bsd_arr, gender, date);


              // console.log(bsd_arr);

              console.log("val(for notif target list ):", valuesArray);

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
                      `bsd_id in ${targetClass} and t1.user_id=t2.user_id and t2.firebase_token is not null and t1.isDisabled=0 and t1.isDelete=0;`
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
                console.log("qryyyyy:", queryy); //this qry will select those users only whose fcm token is not null and they belong to the target class and gender 
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
                  const values = generateValuesArray(nm_id, targetUserId, 0, date); //0 is for isRead i.e notif is not read by user 
                  console.log("status table:", values);
                  qry2 = `Insert into cluedin.user_notification_status (nm_id,user_id,isRead,dateOfCreation) values ? ;`
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


            });
          }

          req.flash("message1", "Notification Sent ");
          res.redirect("/notification");
        });
      }else {res.redirect('/notification')}
      // console.log(sql_1);
    } catch (error) {
      console.log(error);
      req.flash("err_message1", "There was problem sending notification.Please trty again");
      return res.redirect('/notification')
    }
  },
};


//cases to cover 
//if fcmToken has some null values then server will crash and no one will recieve notif. 
//To solve : What to do if fcmtoken srray has null values.?
//solution for now : we can traverse through the array and pop the null values and store the user id and username of the null values users in other list and display the msssage that the users don't have app installed so can'nt send notif.

//update : now null values are getting removed and notif is sent to only to not null tokens