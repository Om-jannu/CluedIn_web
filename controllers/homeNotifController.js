const pool = require('../models/dbConnect');
const firebaseAdmin = require("firebase-admin");
const { credential } = require('firebase-admin');
const serviceAccount = require("../cluedInOfficialAndroid.json");

module.exports = {

    post : async (req , res) => {
        // fetching details 
        // console.log(req.body);   
        firebaseAdmin.initializeApp({credential:firebaseAdmin.credential.cert(serviceAccount)});      

        var notif_title = req.body.notif_title;
        // console.log(notif_title);
        var notif_desc  = req.body.notif_desc;
        var exp_date  = req.body.exp_date;
        var scheduled_date = req.body.scheduled_date;
        var category   = req.body.category;  
        var label = req.body.label;

        // var sql = "INSERT INTO notif_table (title,message,expDate,schDate,category) VALUES ?";
        var sql = "INSERT INTO user_message (message_title,user_message,dateOfExpiration,scheduled_date,category,message_label) VALUES ?";
        var values = [
          [notif_title,notif_desc,exp_date,scheduled_date,category,label]
        ];
        pool.query(sql,[values], (err, result) => {
        if (err) res.send(err);
        // res.send("notif sent");
        console.log("data inserted finally!!!")
        });
        
            var getFcmTokensSql = ["ftqCvTWuTEOXogZjgv6YpR:APA91bG0LFFASBy8Msn54FJ75wFR2hkZFbs14KOLA02Tl4XXQRzJJ_n0JxJTslA-EgCeqoHNDnv9yRz3L5s-5POx77m7RcdKils9kHeMJlAcSa3R5lbi56tfcaJUlaeXfawBfe8Xzr9X","fkwNdJprRxaVK1tYpPSFBL:APA91bFRd3em3Eqkp0oqXTZJG0YQ33uNzPYmgh0jeX7bUMslYvEH2SaNcrMGbi_Cv7xH4zSXDyGWJnMhjAMY__36ilAl4aBsy85CSEfCYFFrX67OEBFnzdLwUeUMkson-X8apCkGlf2D"];
            // pool.query(getFcmTokensSql,(err,result)=>{
                // if(err) throw err;

            const payload = {
           notification:{
               title:req.body.notif_title,
               body:req.body.notif_desc,
               // imageUrl: "https://my-cdn.com/extreme-weather.png",
               click_action:"FLUTTER_NOTIFICATION_CLICK",
           },
           data : {
               data1 : "data1",
               data2 : "data2",
           },
        }
        const options ={
           priority : "high",
           timeToLive : 60*60,
        }
        // console.log({result}["result"].map((userResult)=>
        //     userResult["firebase_token"]));
          firebaseAdmin.messaging().sendToDevice(getFcmTokensSql,payload,options);
        // }); 
            res.send("ok");
        
        // data[fcmToken()];
        // console.log(fcmToken());
        // ----------------------firebase notification-------------------------
        // const fcmToken = [
        //     "ebjzXqouTCeRUMTvWlwP0e:APA91bEcYr-AaP8xNftjJx0ATqtpgQ4_ucGOwm_JfTyTPkJunhFakRxpqqFJrjbo9kMbQ7cQC1_H43IgK3y0dOQFtMOKBuV2cUZfUrwYoIxGpJeh62oNmN5uRVAIFb5vfHYOWKeA1EMM",
        //     "dUNs1KbMTTuC9IJ1YN-QNN:APA91bEtf_3484eeJQDboSsV-I7Fddn3JjAKtpUsuQoMamaVAr3x9MTEqksoJolOPgQyQE8KUR_3-Eoy9AFX2XmoxyDbyqExrrCkEg_-_qfC4lJ_K_0uHHQTqFnWcrRSjrMB9ncMDmmq",
        // ];


        
//         //  res.send("notification send");
//     }

// ye dono nikaalna badmai
}
}