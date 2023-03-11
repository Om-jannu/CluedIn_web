//import modules
const { ServiceCatalogAppRegistry } = require("aws-sdk");
const express = require("express");
const router = express.Router();
const path = require("path");
const { abort } = require("process");
const multer = require("multer");
const authenticateToken = require("../middleware/auth")

//import controller files
let authAppUser = require("../controllers/appControllers/authAppUser");
let firebase_token = require("../controllers/appControllers/firebaseTokenAPI");
const pool = require("../models/dbConnect");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json);

//app authentication
router.post("/authAppUser", authAppUser.post); // http://128.199.23.207:5000/api/app/authAppUser

//store firebase token from app into database
router.post("/firebaseToken", firebase_token.post); //http://cluedin.creast.in:5000/api/app/firebaseToken


router.post("/appNotif", authenticateToken, (req, res) => {
  let user_id = req.body.user_id
  console.log("====================================Inside appNotif api=====================================");
  console.log(req.body);
  // var bsd_id = req.body.bsd_id;
  // var gender = req.body.gender;
  //queries
  // qry1 =
  //   `SELECT  t1.nm_id, t1.nm_title,t1.nm_message,t1.nm_image_url,t1.dateOfcreation,
  //   t2.user_fname,t2.user_lname,t2.user_profilePic,
  //   t3.role_name,
  //   t4.label_name,
  //   t5.nm_id
  //  FROM cluedin.notification_message t1,   
  //   user_details t2,    
  //   role_master t3, 
  //   label_master t4,
  //   notification_message_targetlist t5 
  //  WHERE  t5.nm_id = t1.nm_id 
  //   and t5.bsd_id = "${bsd_id}" 
  //   and (t5.nm_gender = ${gender} or t5.nm_gender = 0)
  //   and t1.sender_id = t2.user_id   
  //   and t3.role_id = t2.user_role_id 
  //   and t4.label_id = t1.nm_label_id
  //  ORDER BY t1.dateOfCreation DESC ;
  //  Select label_name from label_master;
  //  Select role_name from role_master`;

  //above qry was to fetch the notifications if given bsd id and gender 

  qry2 =

    `SELECT 
    t5.nm_id as notification_id,t1.nm_title as notification_title,
    t1.nm_message as notification_message,
    t1.nm_image_url as image_url,t1.nm_attachment_url as attachment_url ,
    t1.dateOfCreation,
    t2.user_fname as sender_fname,t2.user_lname as sender_lname,
    t2.user_profilePic as senderProfilePic,
    t3.role_name as senderRole,
    t4.label_name as notification_label,
    t5.isRead
   FROM cluedin.notification_message t1,   
    user_details t2,    
    role_master t3, 
    label_master t4,
    user_notification_status t5 
   WHERE  
    t5.nm_id = t1.nm_id
    and t2.user_id = t1.sender_id
    and t2.user_role_id = t3.role_id
    and t1.nm_label_id = t4.label_id 
    and t5.user_id = ${user_id}
   ORDER BY t1.dateOfCreation DESC;
   Select label_name from label_master;
   Select role_name from role_master`

  //this qry gives the notifications on the basis of only usermobno


  // qry2 = `Select label_name from label_master`;
  // qry3 = `Select role_name from role_master`;

  pool.query(qry2, (err, result) => {
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
    console.log("response sent ig");
  });
});     //http://128.199.23.207:5000/api/app/appNotif

//appEvent api 
router.get("/appEvent", authenticateToken, (req, res) => {
  console.log("============Events API======================");
  // var bsd_id = req.body.bsd_id;  
  // var gender = req.body.gender; 
  //queries
  qry1 =
    `SELECT el_name FROM events_label_master;
  SELECT sb_name FROM student_bodies_master;
  SELECT  t1.event_id,t2.user_fname as sender_fname,t2.user_lname as sender_lname,t5.role_name as senderRole,t3.sb_name as organizedBy, t2.user_profilePic as senderProfilePic,
          t1.event_title,t4.el_name as event_label,t1.event_desc,t1.event_image_url,t1.event_attachment_url,
          t1.event_registration_url as registration_link,t1.event_fees as registration_fee,t1.dateOfCreation,t1.dateOfExpiration as   dateOfExpiration
  FROM
          events t1,   
          user_details t2,    
          student_bodies_master t3, 
          events_label_master t4,
          role_master t5 
  WHERE
          t1.sender_id = t2.user_id 
          and t1.organiser_id = t3.sb_id 
          and t1.event_label_id = t4.el_id 
          and t2.user_role_id = t5.role_id
  ORDER BY t1.event_id DESC`;


  // qry2 = `Select label_name from label_master`;
  // qry3 = `Select role_name from role_master`;

  pool.query(qry1, (err, result) => {
    if (err) console.log(err);
    let Data = JSON.parse(JSON.stringify(result));
    // console.log(Data);

    let labelData = [];
    let organiserData = [];
    let eventData = Data[2];
    for (let index = 0; index < Data[0].length; index++) {
      labelData.push(Data[0][index].el_name);
    }
    for (let j = 0; j < Data[1].length; j++) {
      organiserData.push(Data[1][j].sb_name);
    }
    // console.log("labels\n", labelData);
    // console.log("organisers data\n", organiserData);
    // let roleData = JSON.parse(JSON.stringify(result[2]))
    // console.log("result\n",notifData,labelData,roleData);
    res.json({
      labels: labelData,
      organizers: organiserData,
      events: eventData,
    });
  });
});     //http://128.199.23.207:5000/api/app/appEvent

// router.get("/profile", (req, res) => {
//   let mobno = req.query.mobno;
//   qry = `SELECT t1.user_fname,t1.user_lname,t1.user_mobno,t1.user_email,t2.branch_name , t1.user_profilePic from user_details t1 , branch t2 where t1.user_mobno="${mobno}" and t1.user_department=t2.branch_id;`;
//   pool.query(qry, (err, result) => {
//     if (err) console.log(err);
//     let profileData = JSON.parse(JSON.stringify(result[0]));
//     // console.log(profileData);
//     res.json({ data: profileData });
//   });
// }); //http://128.199.23.207:5000/api/app/profile   --get req


var Path = path.join(__dirname, "..", "uploads", "profilePic");
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, Path);
  },
  filename: (req, file, cb) => {
    cb(null, "studProfile" + "-" + req.body.mobno + ".png");
  },
});
const uploadStudImg = multer({
  storage: storage2,
});

router.post('/updateProfile', authenticateToken, uploadStudImg.single('image'), (req, res) => {
  var mobno = req.body.mobno;
  console.log("mobno:", mobno);
  var server_url = "profile/"
  profileUrl = path.join(server_url, req.file.filename);
  console.log("imgUrl:", profileUrl);
  qry = `Update user_details SET user_profilePic = "${profileUrl}" where user_mobno = "${mobno}"`
  pool.query(qry, (err, result) => {
    if (err) throw err;
    console.log("success");
  })
  res.json({ img_url: profileUrl })
}); // http://128.199.23.207:5000/api/app/updateProfile

router.post('/notifReadStatus', (req, res) => {
  console.log(req.body);
  let user_id = req.body.user_id;
  let isRead = req.body.isRead;
  let nm_id = req.body.nm_id;
  console.log(req.body)
  if (!req.body.user_id || !req.body.isRead || !req.body.nm_id) {
    return res.status(400).json({ success: false, data: null, msg: 'Missing values in request body' });
  }

  else {
    qry = `Update user_notification_status SET isRead = "${isRead}" where user_id = ${user_id} and nm_id=${nm_id}`
    pool.query(qry, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.status(200).json({ success: true, data: null, msg: "isRead updated" })
    })
  }

});  // http://128.199.23.207:5000/api/app/notifReadStatus

router.get('/homeapi', authenticateToken, (request, response) => {
  let get_featured_events_qry = `
  SELECT feat_event_name as event_name,
  feat_event_imgUrl as photo_link,
  feat_event_redirectUrl as redirect_link
  FROM cluedin.featured_events where isFeatured=1;`

  let student_chap_json = [
    {
      "title": "Computer Society of India (CSI)",
      "Established_in": 2006,
      "desc": "CSI, well known for Computer Society of India is another reputed student chapter under the Department of Information Technology. \n\nThe Computer Society of India is a non-profit professional organisation that meets to discuss ideas, study, and share information. \n\nCSI also promotes and supports professionals in maintaining the profession's integrity and competence, and it creates a feeling of cooperation among members. \n\nTwo of the major flagships events of CSI at Don Bosco Institute of Technology are: Game of codes & Coding premier league, where students across the engineering departments come together and innovate solutions over various problem statements!",
      "logo": "https://drive.google.com/uc?id=1sXg-EzVUu8FuglUg3To8UB7Yd-iAav05",
      "cover_pic": "https://drive.google.com/uc?id=1sXg-EzVUu8FuglUg3To8UB7Yd-iAav05",
      "website": "https://csi.dbit.in/"
    },
    {
      "title": "Association for Computing Machinery (ACM)",
      "Established_in": 2003,
      "desc": "ACM, well known for Association for Computing Machinery is a reputed student chapter under the Department of Computer Engineering. Through strong leadership, advocacy of the highest standards, and acknowledgment of technological accomplishment, ACM enhances the computer profession's collective voice. \n\nACM encourages its members' professional development by offering opportunities for lifelong learning, career advancement, and professional networking. \n\n‘Teknack’ is the flagship event of ACM wherein all students interested in game development come together to produce games using their creativity, technical skills and vivid frameworks and publish them over Google Playstore platform.",
      "logo": "https://drive.google.com/uc?id=1HG8UhFDYn1VKu7wNv_87d360CoB7xQbn",
      "cover_pic": "https://drive.google.com/uc?id=1HG8UhFDYn1VKu7wNv_87d360CoB7xQbn",
      "website": "https://dbit.acm.org/"
    },
    {
      "title": "Institute of Electrical and Electronics Engineers (IEEE)",
      "Established_in": 2006,
      "desc": "The IEEE society at Don Bosco Institute of Technology is a professional organisation that creates, defines, and evaluates standards in electronics and computer science. \n\nIts goal statement is to promote technical innovation and excellence for the benefit of humanity. \n\nIEEE and its members inspire a community through its highly cited publications, conferences, technology standards, and professional and various educational activities which will make the students ready for the corporate world!",
      "logo": "https://drive.google.com/uc?id=1wtoBJSCuZOR38QxcRJXdGOfXRWI77kmG",
      "cover_pic": "https://drive.google.com/uc?id=1wtoBJSCuZOR38QxcRJXdGOfXRWI77kmG",
      "website": "https://ieee.dbit.in/"
    },
    {
      "title": "Social Innovation for Environment Club (SIE)",
      "Established_in": 2003,
      "desc": "Amidst the thickly populated concrete jungles of the suburban Kurla, of Mumbai district, DBIT is an oasis of greenery. With a huge football ground and abundant lush green trees it's full of serenity and is a home for a variety of birds. \n\nWith our Don Bosco values the students, faculty of SIE Club pledge to make the campus carbon neutral, create environmental awareness and promote sustainability with sustainable lifestyle using innovative engineering.",
      "logo": "https://drive.google.com/uc?id=1BRFcckx15r6ZeKFj-MqTs_-YWdHH29Ix",
      "cover_pic": "https://drive.google.com/uc?id=1BRFcckx15r6ZeKFj-MqTs_-YWdHH29Ix",
      "website": "https://acm.dbit.org/"
    },
    {
      "title": "Institution of Electronics and Telecommunication Engineers (IETE)",
      "Established_in": 2006,
      "desc": "The IETE society at Don Bosco Institute of Technology is a professional organisation that creates, defines, and evaluates standards in electronics and computer science. \n\nIts goal statement is to promote technical innovation and excellence for the benefit of humanity. \n\nIETE and its members inspire a community through its highly cited publications, conferences, technology standards, and professional and various educational activities which will make the students ready for the corporate world!",
      "logo": "https://drive.google.com/uc?id=1KKO1zUOJLtl8mEYon58tmYpAVyfL2Jch",
      "cover_pic": "https://drive.google.com/uc?id=1KKO1zUOJLtl8mEYon58tmYpAVyfL2Jch",
      "website": "https://ieee.dbit.in/"
    }
  ];

  try {
    pool.query(get_featured_events_qry, (error, result) => {
      if (error) throw error;
      let Data = JSON.parse(JSON.stringify(result));
      // response.send(Data);
      response.json(
        {
          featured_carousel: Data,
          student_chapters: student_chap_json,
        }
      )
    })
  } catch (err) {
    response.send(err);
  }
}) // http://128.199.23.207:5000/api/app/homeapi
module.exports = router;
