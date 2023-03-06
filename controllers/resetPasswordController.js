const jwt = require("jsonwebtoken");
const path = require("path");
const pool = require("../models/dbConnect");

module.exports = {
    get: (req, res) => {
        console.log("--------------------------Inside reset password(/reset-password)-------------------------");
        var Path = path.join(__dirname, "..", "views", "resetPassword");
        const { id, token } = req.params;
        let getUserQry = `SELECT * FROM cluedin.user_details where user_id=${id};`;
        pool.query(getUserQry, (err, result) => {
            if (err) throw err;
            let data = JSON.parse(JSON.stringify(result));
            if(id != data[0].user_id){
                res.redirect('/signup');
                return;
            }
            else{
                let secret = process.env.JWT_SECRET + data[0].dateOfCreation;
                try {
                    const payload = jwt.verify(token,secret);
                    res.render(Path, { err: req.flash("err"), success: req.flash("success") });
                } catch (error) {
                    res.send(error);
                }
            }
        });
    },
    post: (req, res) => {
        const { id, token } = req.params;
        let { password, confirmPassword } = req.body;
        var dateOfCreation;
        let getUserDOCQry = `SELECT * FROM cluedin.user_details where user_id=${id};`;
        
        if (password != confirmPassword) {
            req.flash('err', "Paswords don't match");
            res.redirect(`/reset-password/${id}/${token}`);
        }
        else {
            pool.query(getUserDOCQry, (err, result) => {
                if (err) throw err;
                let data = JSON.parse(JSON.stringify(result));
                console.log(data[0].dateOfCreation);
                dateOfCreation = data[0].dateOfCreation;
                let secret = process.env.JWT_SECRET + dateOfCreation;
                try {
                    const payload = jwt.verify(token,secret);
                    let updPwdQry = `UPDATE user_details SET user_pwd = "${password}" WHERE user_id = ${data[0].user_id};`
                    pool.query(updPwdQry,(err,result)=>{
                        if(err)throw err;
                        req.flash('success', `Password updated successfully`);
                        res.redirect('/signup');
                    })
                } catch (error) {
                    res.send(error);
                }
            });
        }
    }
};