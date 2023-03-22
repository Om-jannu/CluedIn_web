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
app.get('/images/:file', function (req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads', 'notifImg', file);
  res.sendFile(fileLocation);
});
app.get('/feat_event_images/:file', function (req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads', 'feat_events', file);
  res.sendFile(fileLocation);
});

//routes to generate profile pic img link
app.get('/profile/:file', function (req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads', 'profilePic', file);
  res.sendFile(fileLocation);
});
//route to open pdf file from notifAttachment folder
app.get('/file/:file', function (req, res) {
  var file = req.params.file;
  var fileLocation = path.join(__dirname, 'uploads', 'notifAttachment', file);
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
app.use("/notification", homeRoute);
app.use("/logout", homeRoute);
app.use("/signup", homeRoute);
app.use("/signupotp", homeRoute);
app.use('/reset-password:/id/:token', homeRoute);
app.use(express.static(__dirname + "/views"));
//profile
app.use('/profile', homeRoute);

//routes related to notifications 
app.use("/sendNotif", homeRoute);
app.use("/action", homeRoute);     //for datatable od list notif 
app.use("/targetCount", homeRoute)   //to get count of target users in sendnotif form 
// app.use("/listNotif", homeRoute);

//events routes 
app.use("/event", homeRoute);
app.use("/postevent", homeRoute);

//routes related to user creating user 
app.use("/createUser", homeRoute);
app.use("/listuser", homeRoute);
// app.use("/import-excel", importExcel);
app.use("/updateuser", homeRoute);
//bulk user Creation
app.use("/bulkUserCreate", homeRoute);

//role master
app.use("/dbapi", dbApiRoute);

//featured events routes
app.use('/featuredEvent', homeRoute);
app.use('/postFeaturedEvent', homeRoute);
app.use('/listfeatured', homeRoute);
app.use("removefeatured", homeRoute);

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


app.use("/import-excel",homeRoute);



var now = new Date().toLocaleString('en-US', {
  timeZone: 'Asia/Calcutta'
});
console.log("date:", now);

const date1 = new Date(new Date().toUTCString());
console.log("UTC Format date", date1);
// const indianDate = now.toLocaleDateString('en-IN', options);

// console.log(indianDate);

console.log("dirname:", __dirname);

//creating server
var port = process.env.PORT || 5000;
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`server running http://cluedin.creast.in:${port}`);
  console.log(`server running http://localhost:${port}`);
});
