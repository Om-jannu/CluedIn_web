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
    qry = `SELECT nm_id,userName,userRole,message_title,message_label,user_message,image_url,dateOfcreation from cluedin.user_message where isDelete = 0 ORDER BY dateOfcreation DESC`
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
})//http://128.199.23.207:5000/api/app/profile   --get req 
module.exports = router;
