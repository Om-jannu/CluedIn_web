const pool = require('../models/dbConnect');

module.exports = {
  get: (req, res) => {
    console.log("-----------------------------Inside targetUserCount-----------------------------");
    // let bsd_id = req.query.bsd_id
    console.log(req.query);
    const selectedClasses = req.query.classes.split(',');
    const selectedGender = req.query.genderCode;
    // arr = []
    // arr.push(bsd_id)
    // console.log(arr);
    console.log(selectedClasses, selectedGender);
    let targetClass = `(${selectedClasses.join(",")})`
    // console.log(targetClass);

    var params = {};

      if (selectedGender != 0) {
        params.selectedGender = selectedGender;
      }

    function buildConditions(params) {
      var conditions = [];
      var values = [];
      var conditionsStr;

      if (typeof params.selectedGender !== "undefined") {
        conditions.push("t2.user_gender = ?");
        values.push(parseInt(params.selectedGender));
      }

      if (1) {
        conditions.push(
          `t1.user_id = t2.user_id and t1.bsd_id in ${targetClass} and t2.isDelete=0 and t2.isDisabled=0;`
        );
        // values.push(parseInt(params.target_gender));
      }

      return {
        where: conditions.length ? conditions.join(" AND ") : "1",
        values: values,
      };
    }

    var conditions = buildConditions(params);
    // console.log("gebderrrr",conditions.values); 
    let qry = "select count(t1.user_id) as total_students from Student_branch_standard_div_ay_rollno_sem_mapping t1, user_details t2 where " + conditions.where
    // console.log("query",qry);

    const values = [selectedClasses];
    if (selectedClasses[0] == '0' &&selectedGender==0 ) {
      console.log("inside if of all class and all gender");
      qry = `select count(user_id) as total_students from Student_branch_standard_div_ay_rollno_sem_mapping `
    }
    if (selectedClasses[0] == '0' &&selectedGender==1 ) {
      console.log("inside if of all class and male");
      qry = `select count(t1.user_id) as total_students from Student_branch_standard_div_ay_rollno_sem_mapping t1, user_details t2 
      where  t1.user_id = t2.user_id and t2.isDelete=0 and t2.isDisabled=0 and t2.user_gender = 1 `
    }
    if (selectedClasses[0] == '0' &&selectedGender==2 ) {
      console.log("inside if of all class and female");
      qry = `select count(t1.user_id) as total_students from Student_branch_standard_div_ay_rollno_sem_mapping t1, user_details t2 
      where  t1.user_id = t2.user_id and t2.isDelete=0 and t2.isDisabled=0 and t2.user_gender = 2  `
    }
    pool.query(qry, conditions.values, (error, results, fields) => {
      if (error) {
        console.error(error);
        res.sendStatus(500);
      } else {
        const totalStudents = results[0].total_students;
          // console.log("response",totalStudents);
        res.json({ totalStudents });
      }
    });
  }
}