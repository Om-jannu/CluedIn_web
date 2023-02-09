//import modules
const { ServiceCatalogAppRegistry } = require("aws-sdk");
const express = require("express");
const router = express.Router();
const path = require("path");
const { abort } = require("process");
const multer = require("multer");

//import controller files
let authAppUser = require("../controllers/appControllers/authAppUser");
let firebase_token = require("../controllers/appControllers/firebaseTokenAPI");
const pool = require("../models/dbConnect");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json);

//app authentication
router.post("/authAppUser", authAppUser.post); // http://localhost:5000/api/app/authAppUser

//store firebase token from app into database
router.post("/firebaseToken", firebase_token.post); //http://localhost:5000/api/app/firebaseToken


router.post("/appNotif", (req, res) => { 
  var bsd_id = req.body.bsd_id;  
  var gender = req.body.gender; 
  //queries
  qry1 = 
  `SELECT  t1.nm_id, t1.nm_title,t1.nm_message,t1.nm_image_url,t1.dateOfcreation,
    t2.user_id, t2.user_fname,t2.user_lname,t2.user_profilePic,
    t3.role_name,
    t4.label_name,
    t5.nm_id
   FROM cluedin.notification_message t1,   
    user_details t2,    
    role_master t3, 
    label_master t4,
    notification_message_targetlist t5 
   WHERE  t5.nm_id = t1.nm_id 
    and t5.bsd_id = "${bsd_id}" 
    and (t5.nm_gender = ${gender} or t5.nm_gender = 0)
    and t1.sender_id = t2.user_id 
    and t3.role_id = t2.user_role_id 
    and t4.label_id = t1.nm_label_id
   ORDER BY t1.dateOfCreation DESC ;
   Select label_name from label_master;
   Select role_name from role_master`;


  // qry2 = `Select label_name from label_master`;
  // qry3 = `Select role_name from role_master`;

  pool.query(qry1, (err, result) => {
    if (err) console.log(err);
    let Data = JSON.parse(JSON.stringify(result));
    // console.log(Data);

    let labelData = [];
    let roleData = [];
    let notifData = Data[0];
    for (let index = 0; index < Data[1].length; index++) {
      labelData.push(Data[1][index].label_name);
    }
    for (let j = 0; j < Data[2].length; j++) {
      roleData.push(Data[2][j].role_name);
    }
    // console.log(labelData);
    // console.log("role data\n", roleData);
    // let roleData = JSON.parse(JSON.stringify(result[2]))
    // console.log("result\n",notifData,labelData,roleData);
    res.json({
      labels: labelData,
      senderRoles: roleData,
      notifications: notifData,
    });
  });
});     //http://128.199.23.207:5000/api/app/appNotif

router.get("/profile", (req, res) => {
  let mobno = req.query.mobno;
  qry = `SELECT t1.user_fname,t1.user_lname,t1.user_mobno,t1.user_email,t2.branch_name from user_details t1 , branch t2 where t1.user_mobno="${mobno}" and t1.user_department=t2.branch_id;`;
  pool.query(qry, (err, result) => {
    if (err) console.log(err);
    let profileData = JSON.parse(JSON.stringify(result[0]));
    // console.log(profileData);
    res.json({ data: profileData });
  });
}); //http://128.199.23.207:5000/api/app/profile   --get req


var Path = path.join(__dirname, "..", "uploads", "studentProfilePic");
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,Path);
  },
  filename: (req, file, cb) => {
    cb(null, "stud" + "-" + Date.now() + "-" + file.originalname);
  },
});
const uploadStudImg = multer({
  storage: storage2,
});

router.post('/updateProfile',uploadStudImg.single('image'),(req,res)=>{
  var mobno = req.body.mobno;
  console.log("mobno:",mobno);
  var server_url = "profile/"
  profileUrl = path.join(server_url,req.file.filename);
  console.log("imgUrl:",profileUrl);
  qry = `Update user_details SET user_profilePic = "${profileUrl}" where user_mobno = "${mobno}"`
  pool.query(qry,(err,result)=>{
    if (err) throw err;
    console.log("success");
  })
  res.json({img_url:profileUrl})
}); // http://128.199.23.207:5000/api/app/updateProfile
module.exports = router;
