const express = require("express");
const homeController = require("../controllers/homeController");
const notifController = require("../controllers/homeNotifController");
const notifData = require("../controllers/notifDatatableController");

// const listNotif = require('../controllers/listNotifController');

const multer = require("multer");
const sharp = require("sharp"); //to compress web profile pic
const session = require("express-session");

const { s3Uploadv2, s3Uploadv3 } = require("../models/s3Service");
const router = express.Router();
const firebaseAdmin = require("firebase-admin");
const dashboard = require("../controllers/dashboardController");

const dbApiController = require("../controllers/dbApiController");

const pool = require("../models/dbConnect");

// const bcryptjs = require("bcryptjs");
const cluedinAppSignupController = require("../controllers/CluedinAppSignupController");
const cluedinAppSigninController = require("../controllers/cluedinAppSigninController");
const cluedinAppRecieveMessagesController = require("../controllers/cluedinApprecieveMessageController");

const app = express();
const path = require("path");
const createUser = require("../controllers/createUser");
const authUser = require("../controllers/authUser");
const logoutController = require("../controllers/logoutController");
const listuser = require("../controllers/listusercontroller");
const listNotif = require("../controllers/listNotifController");
const updateuser = require("../controllers/updateuserController");
const deleteuser = require("../controllers/deleteuserController");
const webUserProfile = require("../controllers/web-profile_edit");
let authAppUser = require("../controllers/appControllers/authAppUser");
let event = require("../controllers/eventController");
// firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert(require("../cluedInOfficialAndroid.json")),
// });

app.use(express.urlencoded({ extended: true }));
app.use(express.json);

// app.set('view engine', 'hbs');

router.get("/", homeController.get);
//login validation
router.post("/auth", authUser.post);

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.split("/")[0] === "image") {
//     cb(null, true);
//   } else {
//     cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10000000, files: 1 },
// });
// // size limit - 10 mb

// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const result = await s3Uploadv2(req.file);
//     console.log(
//       "-------------------------------------------------------upload-------------------------------------------------\n",
//       result.Location
//     );
//     return res.json({ status: "success" });
//   } catch (err) {
//     console.log(err);
//   }
// });

//dashboard
router.get("/dashboard", dashboard.get);

//profile page
router.get("/profile", webUserProfile.get);
router.post("/profile", webUserProfile.edit);

var Path1 = path.join(__dirname, "..", "uploads", "tempProfile");
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, Path1);
  },
  filename: (req, file, cb) => {
    // cb(null, "Jasmit-Userprofile" + "-" + Date.now() + "-" + file.originalname);
    var session = req.session;
    const ext = path.extname(file.originalname);
    cb(null, "Userprofile" + "-" + session.userid + ".jpg");
  },
});
const uploadProfileImg = multer({
  storage: storage2,
});

router.post(
  "/uploadProfile",
  uploadProfileImg.single("UserprofileImg"),
  webUserProfile.updateProfile
);

//event page route
router.get("/event",event.get);

var PATH = path.join(__dirname, "..", "uploads", "eventImg");
const storage3 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    cb(null, "event" + "-" + Date.now() + "-" + file.originalname);
  },
});
const uploadEventImg = multer({
  storage: storage3,
});
router.post("/postevent",uploadEventImg.single('event_img'),event.post)


//destroying session
router.get("/logout", logoutController.get);

//post req to insert data into user table
router.post("/submitUser", createUser.post);

router.get("/createuser", function (request, response) {
  // console.log('create user')
  let session = request.session;

  if (session.userid) {
    //for dropdown options of bulk creation
    qry = `SELECT ay_id,ay_name FROM academicyear_master;SELECT bsd_id,bsd_value FROM BranchStd_Div_Mapping Where bsd_id not in (6,7,8,9,10,14,15,16,17,18,22,23,24,25,26,30,31,32,33,34,35);`;
    pool.query(qry, (err, result) => {
      if (err) {
        throw err;
      }
      var data = JSON.parse(JSON.stringify(result));
      var ay = data[0];
      var bsd = data[1];
      // console.log(ay);
      //rendering createuser page
      response.render("createUser", {
        message: request.flash("message"),
        ay: ay,
        bsd_data: bsd,
        userName: session.user_name,
        ProfileUrl: session.userProfileUrl,
      });
    });
  } else {
    var Path = path.join(__dirname, "..", "views", "login");
    // console.log("path to createuser:",Path);
    response.redirect("/");
  }
});

router.get("/action", notifData.get);

//update user details
router.get("/updateuser", updateuser.update);

//list , edit , display users list
router.post("/listuser", listuser.list);
//for delete
router.get("/listuser", deleteuser.delete);

var Path = path.join(__dirname, "..", "uploads", "notifImg");
const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, Path);
  },
  filename: (req, file, cb) => {
    cb(null, "nm" + "-" + Date.now() + "-" + file.originalname);
  },
});
const uploadImg = multer({
  storage: storage1,
});

router.post("/sendNotif", uploadImg.single("notif-img"), notifController.post);

router.post("/api/signup", cluedinAppSignupController.post);
router.post("/api/signin", cluedinAppSigninController.post);
router.post("/tokenisvalid", cluedinAppSigninController.post);
router.get("/api/recieveMessage", cluedinAppRecieveMessagesController.get);

router.get("/dbapi", dbApiController.get);

module.exports = router;
