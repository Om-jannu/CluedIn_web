const pool = require("../models/dbConnect");
var flash = require("connect-flash");
const session = require("express-session");
const xlsx = require("xlsx");

module.exports = {
    bulk: async (req, res) => {
        console.log("============================Inside Bulk User Route=======================");
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

        let qry3 = `SELECT  count(user_id) as duplicate from user_details where user_mobno = ? or user_email = ?`
        let query_1 = //for loop
            "INSERT INTO user_details (user_fname,user_lname,user_gender,user_email,user_mobno,user_addr,user_pincode,user_role_id,user_department) VALUES (?)";
        let query_2 = //for loop
            "INSERT INTO Student_branch_standard_div_ay_rollno_sem_mapping (user_id,ay_id,bsd_id,roll_id,sem_id) VALUES (?)";

        // Initialize empty array for duplicate rows
        const duplicateRows = [];
        var values = [];
        var studentData = []
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
                // Map gender value to server value
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
                                    // console.log(err || result);
                                    if (err) throw err;
                                    console.log("result of student mapping table", result);
                                    resolve();
                                })
                            });
                        }
                    })

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
            res.redirect("/createUser");
        }
        else {
            // Return success message
            console.log('Data inserted successfully.');
            console.log(req.file.filename);
            req.flash("success_message", `Users were created successfully`);
            res.redirect("/createUser");
        }
        values = [];
        // console.log("val:", values);

    }
}