const pool = require("../models/dbConnect");
var flash = require("connect-flash");
const session = require("express-session");
const xlsx = require("xlsx");
const path = require("path");

module.exports = {
    get: (req, res) => {
        console.log("================Bulk User Create Page========================");
        let session = req.session;
        var BulkUserPath = path.join(__dirname, "..", "views", "bulkUserCreate");
        // console.log(BulkUserPath);

        if (session.userid) {
            //for dropdown options of bulk creation
            qry = `SELECT ay_id,ay_name FROM academicyear_master;SELECT bsd_id,bsd_value FROM BranchStd_Div_Mapping;`;
            pool.query(qry, (err, result) => {
                if (err) {
                    throw err;
                }
                var data = JSON.parse(JSON.stringify(result));
                var ay = data[0];
                var bsd = data[1];
                // console.log(ay);
                //rendering createuser page
                res.render(BulkUserPath, {
                    Bulk_errMsg: req.flash("err_message"),
                    Bulk_successMsg: req.flash("success_message"),
                    ay: ay,
                    bsd_data: bsd,
                    userName: session.user_name,
                    ProfileUrl: session.userProfileUrl,
                });
            });
        } else {
            // console.log("path to createuser:",Path);
            response.redirect("/");
        }
    },

    bulk: async (req, res) => {
        console.log("============================Inside Bulk User Route=======================");
        //get bsd id from dropdown and store it in local variable and use select qry to get b,s&d
        let bsd_id = req.body.target_class;
        let acadYear = req.body.ay;
        let semester = req.body.sem;
        // console.log("req:", req.file.filename);
        //using xlsx to extract data from sxcel sheet
        var dataexcel = "uploads/users/" + req.file.filename;
        try {
            var wb = xlsx.readFile(dataexcel);
            var sheetname = wb.SheetNames[0];
            var sheetval = wb.Sheets[sheetname];
            var exceldata = xlsx.utils.sheet_to_json(sheetval);
            let qry3 = `SELECT  count(user_id) as duplicate from user_details where user_mobno = ? or user_email = ?`
            let query_1 = //for loop
                "INSERT INTO user_details (user_fname,user_lname,user_gender,user_email,user_mobno,user_addr,user_pincode,user_role_id,user_department) VALUES (?)";
            let query_2 = //for loop
                "INSERT INTO Student_branch_standard_div_ay_rollno_sem_mapping (user_id,ay_id,bsd_id,roll_id,sem_id) VALUES (?)";

            // Initialize empty array for duplicate rows
            const duplicateRows = [];
            var values = [];
            // var studentData = []

            async function runQueries() {
                for (let i = 0; i < exceldata.length; i++) {
                    // Map gender value to server value
                    let genderValue;
                    switch (exceldata[i].user_gender.toString().trim().toLowerCase()) {
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
                    // Map Branch value to server value
                    let branchvalue;
                    switch (exceldata[i].user_department.toString().trim().toLowerCase()) {
                        case 'bsh':
                            branchvalue = 1;
                            break;

                        case 'it':
                            branchvalue = 2;
                            break;

                        case 'comps':
                            branchvalue = 3;
                            break;
                        case 'extc':
                            branchvalue = 4;
                            break;
                        case 'mech':
                            branchvalue = 5;
                            break;
                        default:
                            branchvalue = null;
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
                        // exceldata[i].user_pwd,
                        14, //student
                        // exceldata[i].user_department,
                        branchvalue
                    ];

                    values.push(value);
                    console.log("excel", values);
                    await new Promise((resolve, reject) => {
                        try {
                            pool.query(qry3, [exceldata[i].user_mobno, exceldata[i].user_email], (err, results) => {
                                if (err) throw err;
                                // console.log(results);
                                data = JSON.parse(JSON.stringify(results))
                                console.log(data[0].duplicate);
                                if (data[0].duplicate > 0) {
                                    // Add row to duplicate rows array
                                    console.log("inside if for duplicate");
                                    duplicateRows.push(exceldata[i]);
                                    console.log("duplicateRows", duplicateRows);
                                    resolve();
                                }
                                else {
                                    // Execute INSERT query to insert data into the database
                                    try {
                                        pool.query(query_1, [values[i]], (error, result) => {
                                            // console.log(error || result);
                                            if (error) {
                                                req.flash('err_message', "All fields in the sheet should be NOT NULL")
                                                res.redirect('/bulkUserCreate')
                                            }
                                            else {
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
                                                try {
                                                    pool.query(query_2, [data], (err, result) => {
                                                        // console.log(err || result);
                                                        if (err) throw err;
                                                        console.log("result of student mapping table", result);
                                                        resolve();
                                                    })
                                                } catch (error) {
                                                    console.log("error in inserting into student mapping tabble:\n", error);
                                                    req.flash('err_message', `Error in mapping the student with the rollNo: ${exceldata[i].user_rollno} to it's appropriate class`)
                                                    res.redirect("/createUser")
                                                }
                                            }
                                        });
                                    } catch (error) {
                                        console.log("error in inserting into student user tabble:\n", error);
                                        req.flash('err_message', `Error in creating the student with the rollNo: ${exceldata[i].user_rollno}`)
                                        res.redirect("/createUser")
                                    }
                                }
                            })
                        } catch (error) {
                            console.log("error in inserting into student user tabble:\n", error);
                            req.flash('err_message', `Error in creating the studendts`)
                            res.redirect("/createUser")
                        }

                    })

                }
                console.log("all qries done");
            }
            await runQueries();
            console.log("Duplicate entries found:\n", duplicateRows);
            // console.log(duplicateRows);

            if (duplicateRows.length > 0) {
                // Return error message and duplicate rows array
                let duplicateUserName = []
                for (let j = 0; j < duplicateRows.length; j++) {
                    duplicateUserName.push(duplicateRows[j].user_fname);
                }
                const duplicatenamesString = duplicateUserName.join(', ');
                console.log("names of duplicate users :", duplicatenamesString);
                req.flash("err_message", `Can not create user acc for the student/s - ${duplicatenamesString} `);
                console.log('Duplicate entries found:');
                console.log(duplicateRows);
                res.redirect("/bulkUserCreate");
            }
            else {
                // Return success message
                console.log('Data inserted successfully.');
                console.log(req.file.filename);
                req.flash("success_message", `Users were created successfully`);
                res.redirect("/bulkUserCreate");
            }
            values = [];
            // console.log("val:", values);
        } catch (error) {
            console.log(error);
            req.flash('err_message', "Problem with the excel sheet.Please check the correct format and try uploading again");
            res.redirect('/bulkUserCreate')
        }
    }
}

// TODO validate the excel sheet fields 