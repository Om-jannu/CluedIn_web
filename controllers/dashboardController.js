const session = require("express-session");
const path = require("path");
var flash = require('connect-flash');
const pool = require("../models/dbConnect");

module.exports = {
  get: (req, res) => {
    console.log("--------------------------Inside Dasboard(/dashboard)-------------------------");
    var session = req.session;


    if (session.userid != null) {
      var Path = path.join(__dirname, "..", "views", "index");
      // res.render(Path,{message1 : req.flash('message1')});

      //dynamic data for dropdown in create notif form 
      qry = `SELECT label_id,label_name FROM label_master where isDisabled = 0 and isDelete = 0;
              SELECT bsd_id,bsd_value FROM BranchStd_Div_Mapping where isDisabled = 0 and isDelete = 0;`
      pool.query(qry, (err, result) => {
        if (err) {
          throw err;
        }
        var data = JSON.parse(JSON.stringify(result));
        // console.log(data);
        var label = data[0];
        // console.log(label);
        var bsd = data[1];
        // res.render(Path,{branch_data:data});
        res.render(Path, { message1: req.flash('message1'),err_message1: req.flash('err_message1'), label_data: label, bsd_data: bsd, userName: session.user_name, ProfileUrl: session.userProfileUrl, userRole:session.userRoleId ,roleName:session.userRole});
      })

      // res.render();
    } else {
      // var Path = path.join(__dirname, "..", "views", "login");
      res.redirect('/');
    }
  },
};
