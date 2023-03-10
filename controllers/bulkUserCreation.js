const pool = require("../models/dbConnect");
var flash = require("connect-flash");
const session = require("express-session");

module.exports = {
    bulk: (req, res) => {
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

        let qry3 = `SELECT  count(user_id) from user_details where user_mobno = ? or user_email = ?`
        let query_1 = //for loop
            "INSERT INTO user_details (user_fname,user_lname,user_gender,user_email,user_mobno,user_addr,user_pincode,user_pwd,user_role_id,user_department) VALUES (?)";
        let query_2 = //for loop
            "INSERT INTO Student_branch_standard_div_ay_rollno_sem_mapping (user_id,ay_id,bsd_id,roll_id,sem_id) VALUES (?)";

        // Initialize empty array for duplicate rows
        const duplicateRows = [];
        var values = [];
        var studentData = []
        for (let i = 0; i < exceldata.length; i++) {
            // Map gender value to server value
            let genderValue;
            switch (exceldata[i].user_gender.toLowerCase()) {
                case 'm':
                case 'male':
                    genderValue = 1;
                    break;
                case 'f':
                case 'female':
                    genderValue = 2;
                    break;
                case 'o':
                case 'other':
                    genderValue = 3;
                    break;
                default:
                    genderValue = null;
                    break;
            }
            value = [
                exceldata[i].user_fname,
                exceldata[i].user_lname,
                // exceldata[i].user_gender,
                genderValue,
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
            pool.query(qry3, [exceldata[i].user_mobno, exceldata[i].user_email], (err, results) => {
                if (err) throw err;

                if (results.length > 0) {
                    // Add row to duplicate rows array
                    duplicateRows.push(exceldata[i]);
                } else {
                    // Execute INSERT query to insert data into the database
                    pool.query(query_1, [values[i]], (error, result) => {
                        console.log(error || result);
                        let userId = result.insertId;
                        console.log("userid:", userId);
                        //2nd query
                        data = [];
                        data = [
                            userId,
                            acadYear,
                            bsd_id,
                            exceldata[i].user_rollno,
                            semester
                        ]
                        console.log("data ", data);
                        pool.query(query_2, [data], (err, result) => {
                            console.log(err || result);
                        })
                    });
                }
            })


        }
        if (duplicateRows.length > 0) {
            // Return error message and duplicate rows array
            console.log('Duplicate entries found:');
            console.log(duplicateRows);
        } else {
            // Return success message
            console.log('Data inserted successfully.');
        }
        values = [];
        // console.log("val:", values);
        console.log(req.file.filename);
        req.flash("message", `Users were created successfully`);
        res.redirect("/createUser");
    }
}