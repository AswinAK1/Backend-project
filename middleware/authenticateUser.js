const jwt = require('jsonwebtoken');

function authenticateUser(req, res, next) {
  const token = req.cookies.userToken

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    req.userId = decoded.user.userId
  } catch (error) {
    console.log(error);
    
  }
}
module.exports = { authenticateUser };