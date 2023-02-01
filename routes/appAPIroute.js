//import modules 
const { ServiceCatalogAppRegistry } = require("aws-sdk");
const express = require("express");
const router = express.Router();
const path = require("path");
const { abort } = require("process");

//import controller files 
let authAppUser = require("../controllers/appControllers/authAppUser");
let firebase_token = require("../controllers/appControllers/firebaseTokenAPI");
const pool = require("../models/dbConnect");


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json);

//app authentication
router.post('/authAppUser',authAppUser.post);  // http://localhost:5000/api/app/authAppUser

//store firebase token from app into database
router.post('/firebaseToken',firebase_token.post)  //http://localhost:5000/api/app/firebaseToken


/* 
{
"labels": [
"Academics",
"Exam Cell",
"T&P Cell"
],
"senderRoles": [
"Principal",
"Class Teacher",
"HOD",
"Admission Admin",
"Management",
"Faculty"
],
"notifications": [
{
"notification_id": 1,
"senderName": "Nilesh sir",
"senderRole": "Class Teacher",
"senderProfilePic": "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
"notification_title": "Mini Project demonstration on 15th Sep! ",
"notification_label": "Academics",
"notification_message": "Tomorrow we'll be meeting at 11.15 to see what's the progress on the Dbit App.",
"image_url": "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
"attachment_url": "https://drive.google.com/file/d/1ZWAwmTozuTU_Zm3HBZ9jdTse25ryMEIV/view?usp=share_link",
"dateOfCreation": "2022-09-11T12:46:31.165Z"
}
]
}
http://128.199.23.207:5000/profile/people.png   profile url 
*/
router.post('/appNotif',(req,res)=>{
    //queries 
    qry1 = `SELECT t1.nm_id,t2.user_fname,t2.user_lname,t3.role_name,t2.user_profilePic,t1.nm_title,t4.label_name,t1.nm_message,t1.nm_image_url,t1.dateOfcreation from cluedin.notification_message t1 ,user_details t2 , role_master t3 , label_master t4 Where t1.sender_id = t2.user_id and t2.user_role_id = t3.role_id and t1.nm_label_id = t4.label_id ORDER BY t1.dateOfCreation DESC;Select label_name from label_master;Select role_name from role_master`
    
    /* for all gender is doubt 
    qry for user specific notif (get the bsd id and shayad gender of the user )
    qry2 = `SELECT t5.nm_id,t2.user_fname,t2.user_lname,t3.role_name,t2.user_profilePic,t1.nm_title,t4.label_name,t1.nm_message,t1.nm_image_url,t1.dateOfcreation from cluedin.notification_message t1 ,user_details t2 , role_master t3 , label_master t4, notification_message_targetlist t5  Where t5.nm_id = t1.nm_id and t5.bsd_id = 13 and t5.nm_gender = 1  and t1.sender_id = t2.user_id and t2.user_role_id = t3.role_id and t1.nm_label_id = t4.label_id ORDER BY t1.dateOfCreation DESC`
    hi sir 

    */
    qry2 = `Select label_name from label_master`;
    qry3 = `Select role_name from role_master`;
    pool.query(qry1,(err,result)=>{
        if (err) console.log(err);
        let Data = JSON.parse(JSON.stringify(result))
        console.log(Data);

        let labelData = []
        let roleData = []
        let notifData = Data[0]
        for (let index = 0; index < Data[1].length; index++) {
            labelData.push(Data[1][index].label_name)            
        }
        for (let j = 0; j < Data[2].length; j++) {
            roleData.push(Data[2][j].role_name)            
        }
        console.log(labelData);
        console.log("role data\n",roleData);
        // let roleData = JSON.parse(JSON.stringify(result[2]))
        // console.log("result\n",notifData,labelData,roleData);
        res.json(
            {
                labels:labelData,
                senderRoles:roleData,
                notifications:notifData
            });
    })
})

router.get('/profile',(req,res)=>{
    let mobno = req.query.mobno;
    qry = `SELECT t1.user_fname,t1.user_lname,t1.user_mobno,t1.user_email,t2.branch_name from user_details t1 , branch t2 where t1.user_mobno="${mobno}" and t1.user_department=t2.branch_id;`
    pool.query(qry,(err,result)=>{
        if (err) console.log(err);
        let profileData = JSON.parse(JSON.stringify(result[0]))
        console.log(profileData);
        res.json({data:profileData});
    });
}) //http://128.199.23.207:5000/api/app/profile   --get req 
module.exports = router;