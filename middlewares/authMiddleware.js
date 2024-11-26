const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access Denied, No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid Token" });
  }
};

const extractUserFromToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Attach user info to req for subsequent middlewares/routes
    req.user = user;
    next();
  });
};



// const jwt = require("jsonwebtoken");
// const SECRET_KEY = "your_secret_key"; // Replace with your actual secret key

// const authenticateToken = (req, res, next) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Token missing or invalid" });

//   jwt.verify(token, SECRET_KEY, (err, user) => {
//     if (err) return res.status(403).json({ error: "Token is invalid" });
//     req.userId = user.id; // Assume `user.id` is the user ID in the token payload
//     next();
//   });
// };


module.exports = { authenticateToken , extractUserFromToken};
