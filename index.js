// dependencies
const express = require("express");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const xlsx = require("xlsx");
//declaring routes
//router files
const homeRoute = require("./routes/homeRoute");
const appApi = require("./routes/appAPIroute");
const dbApiRoute = require("./routes/dbApiRoute");

//controller
const importExcel = require("./controllers/importExcelController");
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
const pool = require("./models/dbConnect");

//routes to generate notif img link 
app.get('/images/:file', function(req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads','notifImg', file);
  res.sendFile(fileLocation);
});

//routes to generate profile pic img link
app.get('/profile/:file', function(req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads','profilePic', file);
  res.sendFile(fileLocation);
});
//route to open pdf file from notifAttachment folder
app.get('/file/:file', function(req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads','notifAttachment', file);
  res.sendFile(fileLocation);
});
//flash
var flash = require("connect-flash");
app.use(flash());

//session
const sessions = require("express-session");
const cookieParser = require("cookie-parser");

//set ccokie-parser
app.use(cookieParser());

//----------------session setup------------------------
// var session;
//creating 5 mins from milliseconds
const expiry = 1000 * 60 * 60;

//session middleware
app.use(
  sessions({
    secret: "DBITCluedInsecretkey",
    saveUninitialized: true,
    cookie: { maxAge: expiry },
    resave: false,
  })
);
//--------------------session ended-------------------
//firebase
// const { initializeApp } = require('firebase-admin/app');
const firebaseAdmin = require("firebase-admin");
const { credential } = require("firebase-admin");
const serviceAccount = require("./latest_cluedin-e47b2-46a230e63bad.json");
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

// register view engine
app.set("view engine", "ejs");

//configuring middlewares to handle post request

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(express.json());

//using Routes for web
app.use("/", homeRoute);
app.use("/dashboard", homeRoute);
app.use("/logout", homeRoute);
app.use("/signup", homeRoute);
app.use("/signupotp", homeRoute);
app.use('/reset-password:/id/:token',homeRoute);
app.use(express.static(__dirname + "/views"));
//profile
app.use('/profile',homeRoute);
app.use("/sendNotif", homeRoute);
app.use("/action", homeRoute);
// app.use("/listNotif", homeRoute);

//events routes 
app.use("/event",homeRoute);
app.use("/postevent",homeRoute);

app.use("/createUser", homeRoute);
app.use("/listuser", homeRoute);
// app.use("/import-excel", importExcel);
app.use("updateuser", homeRoute);

//role master
app.use("/dbapi", dbApiRoute);

//featured events routes
app.use('/featuredEve',homeRoute);
app.use('/postFeaturedEve',homeRoute);

// cluedIn app api
app.use("/api/signup", homeRoute);
app.use("/api/signin", homeRoute);
app.use("/tokenIsValid", homeRoute);
app.use("/api/getuser", homeRoute);
app.use("/api/recieveMessage", homeRoute);
app.use("/api/app", appApi);
// app.use("/api/authAppUser", homeRoute);

// handle errors related to multer

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

//import excel
var Path = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/uploads/users");
  },
  filename: (req, file, cb) => {
    cb(null, "stud" + "-" + Date.now() + "-" + file.originalname);
  },
});
const uploadFile = multer({ storage: storage });

function importFileToDb(exFile, req) {
  //get bsd id from dropdown and store it in local variable and use select qry to get b,s&d
  let bsd_id = req.body.target_class;
  let acadYear = req.body.ay;
  let semester = req.body.sem;
  // console.log("req:", req.file.filename);
  //using xlsx to extract data from sxcel sheet
  var dataexcel = "uploads/users/" + req.file.filename;
  var wb = xlsx.readFile(dataexcel);
  var sheetname = wb.SheetNames[0];
  var sheetval = wb.Sheets[sheetname];
  var exceldata = xlsx.utils.sheet_to_json(sheetval);

  let query_1 = //for loop
    "INSERT INTO user_details (user_fname,user_lname,user_gender,user_email,user_mobno,user_addr,user_pincode,user_pwd,user_role_id,user_department) VALUES (?)";
  let query_2 = //for loop
    "INSERT INTO Student_branch_standard_div_ay_rollno_sem_mapping (user_id,ay_id,bsd_id,roll_id,sem_id) VALUES (?)";
  var values = [];
  var studentData = []
  for (let i = 0; i < exceldata.length; i++) {
    value = [
      exceldata[i].user_fname,
      exceldata[i].user_lname,
      exceldata[i].user_gender,
      exceldata[i].user_email,
      exceldata[i].user_mobno,
      exceldata[i].user_addr,
      exceldata[i].user_pincode,
      exceldata[i].user_pwd,
      14,
      exceldata[i].user_department,
    ];
    
    values.push(value);
    console.log(values);
    pool.query(query_1, [values[i]], (error, result) => {
      console.log(error || result);
      let userId = result.insertId;
      console.log("userid:", userId);
      //2nd query
      data=[];
      data = [
        userId,
        acadYear,
        bsd_id,
        exceldata[i].user_rollno,
        semester
      ]
      console.log("data ",data);
      pool.query(query_2,[data],(err,result)=>{
        console.log(err||result);
      })
    });
    
  }
  values = [];
  // console.log("val:", values);
}

/* use any excel read package
0) Get ay_id, sem_id, bsd_id from the html form and store in local variable.
1) Check no. of rows in the excel file
2) for each row 
  a. insert into user_details
  b. You will get user_id from the resultset (aka result).
  c. insert into table aka student mapping table 
*/

app.post("/import-excel", uploadFile.single("students"), (req, res) => {
  importFileToDb(__dirname + "/uploads/users" + req.file.filename, req);
  req.flash("message", `Users were created successfully`);
  res.redirect("/createUser");
});


var now = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Calcutta'
});
console.log("date:", now);

console.log("dirname:",__dirname);

//creating server
var port = process.env.PORT || 5000;
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`server running http://cluedin.creast.in:${port}`);
  console.log(`server running http://localhost:${port}`);
});
