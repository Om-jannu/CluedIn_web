// dependencies
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//declaring routes 
const homeRoute = require("./routes/homeRoute");

//using css , js , jquery .....for styling 
app.set('view engine', 'hbs');
app.use(express.static(__dirname + "/views"));
//configuring middlewares to handle post request 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());       // to support JSON-encoded bodies

//using Routes
app.use("/", homeRoute);
app.use("/sendNotif", homeRoute);

//for fetching notif_table from db 

app.use('/action', homeRoute);
// om

app.use("/register", homeRoute);

//fetching data from mysql table
app.use("/listNotif", homeRoute);

//creating server 
var port = process.env.PORT || 4000;
app.listen(port, (err) => {
    if (err) throw err;
    console.log(`server running http://localhost:${port}`);
});

