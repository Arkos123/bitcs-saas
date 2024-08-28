const jwt = require('jsonwebtoken');

const secret = '9Jr?rFAYZOXHZ^+}uU\\zo2lMZGI@l1*r';


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // 如果没有 token，返回 401 未授权
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.sendStatus(403); // 如果 token 无效，返回 403 禁止访问
    }

    req.user = user;
    next(); // 如果 token 有效，继续处理请求
  });
};

module.exports = {
  authenticateToken,
  secret
};
