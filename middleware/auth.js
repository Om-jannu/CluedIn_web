// const jwt = require("jsonwebtoken");

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header("x-auth-token");
//     if (!token)
//       return res.status(401).json({ msg: "No auth token, access denied" });
      
//     const verified = jwt.verify(token, "passwordKey");
//     if (!verified)
//       return res
//         .status(401)
//         .json({ msg: "Token verification failed, authorization denied." });

//     req.user = verified.id;
//     req.token = token;
//     next();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// module.exports = auth;


// const jwt = require('jsonwebtoken');
// const pool = require("../models/dbConnect"); // assume this file exports a pool of SQL connections

// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ error: 'Invalid token' });
//     }

//     // Check the user's record in the SQL database
//     const mobno = decoded.id;
//     const query = 'SELECT user_token FROM user_details WHERE user_mobno = ?';
//     pool.query(query, [mobno], (error, results, fields) => {
//       if (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal server error' });
//       }

//       if (!results || results.length === 0) {
//         return res.status(401).json({ error: 'Unauthorized' });
//       }

//       const storedToken = results[0].user_token;
//       if (token !== storedToken) {
//         return res.status(403).json({ error: 'Session Expired. Please login again' });
//       }

//       // Token is valid
//       req.user = { id: mobno };
//       next();
//     });
//   });
// }

// module.exports = authenticateToken();

