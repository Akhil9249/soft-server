const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {

    const token = req.headers.authorization;
    console.log("token",token);
    
  
    if (!token)
        return res.status(401).json({
            message: "UnAuthorized",
        });

    const tokenValid = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
    req.userId = tokenValid._id;
    
    next();

  } catch (error) {
    res.status(401).json({
        message: "You are UnAuthorized",
    });
  }
};

module.exports = {
    checkAuth
};
