const jwt = require('jsonwebtoken');
const pool = require("../models/dbConnect"); // assume this file exports a pool of SQL connections

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log("idhar aaya 1");
        return res.status(401).json({ success: "false", data: null, msg: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("idhar aaya 2");
            return res.status(403).json({ success: "false", data: null, msg: 'Invalid token' });
        }

        // Check the user's record in the SQL database
        const user_id = decoded.id;
        // console.log(mobno);
        const query = 'SELECT user_token FROM user_details WHERE user_id = ?';
        pool.query(query, [user_id], (error, results, fields) => {
            if (error) {

                console.error(error);
                return res.status(500).json({ success: "false", data: null, msg: 'Internal server error' });
            }

            if (!results || results.length === 0) {
                console.log("idhar aaya 3");
                return res.status(401).json({ success: "false", data: null, msg: 'Unauthorized' });
            }

            const storedToken = results[0].user_token;
            console.log(token);
            console.log(storedToken);
            if (token !== storedToken) {
                console.log("idhar aaya 5");
                return res.status(403).json({ success: "false", data: null, msg: 'Session Expired. Please login again' });
            }

            // Token is valid
            console.log("legit user hai");
            req.user = { id: user_id };
            next();
        });
    });
}

module.exports = authenticateToken;
