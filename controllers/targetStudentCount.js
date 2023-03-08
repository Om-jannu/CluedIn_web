const pool = require('../models/dbConnect');

module.exports = {
    get: (req,res)=>{
        console.log("-----------------------------Inside targetUserCount-----------------------------");
        // let bsd_id = req.query.bsd_id
        console.log(req.query);
        const selectedClasses = req.query.classes.split(',');
        // arr = []
        // arr.push(bsd_id)
        // console.log(arr);
        console.log(selectedClasses);
        
        let qry = `select count(user_id) as total_students from Student_branch_standard_div_ay_rollno_sem_mapping where bsd_id in (?)`
        const values = [selectedClasses];
        if (selectedClasses[0]=='0') {
            console.log("inside if");
            qry = `select count(user_id) as total_students from Student_branch_standard_div_ay_rollno_sem_mapping `
        }
        pool.query(qry, values, (error, results, fields) => {
            if (error) {
              console.error(error);
              res.sendStatus(500);
            } else {
              const totalStudents = results[0].total_students;
            //   console.log(totalStudents);
              res.json({ totalStudents });
            }
          });
    }
}