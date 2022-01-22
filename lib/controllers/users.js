const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

dotenv.config();

const secret = process.env.TOKEN_SECRET;

const author = (authenticateToken, get_db) => {
  return function (req, res) {
    const db = get_db();
    const { token } = req.body;

    if (!authenticateToken(token)) {
      res.status(201);
      return res.json({
        error: "token expired",
      });
    }

    db.collection("accounts").findOne({ role: 2 }, function (err, result) {
      if (err) throw err;
      return res.json({
        name: result.username,
        email: result.email,
      });
    });
  };
};

const register = (hashpassword, get_db) => {
  return async function (req, res) {
    if (req.body) {
      const db = get_db();
      const { username, password, email } = req.body;
      var hashedp = hashpassword(password);
      // var hashedp = password

      var exists = await db
        .collection("accounts")
        .findOne({ $or: [{ username: username }, { email: email }] });

      if (exists) {
        res.status(201);
        return res.json({
          error: "user exists",
        });
      }

      var resp = await db.collection("accounts").insertOne({
        username,
        email,
        hashedp,
      });
      res.status(200);
      return res.json(resp);
    }

    res.status(201);
    return res.json({
      error: "invalid request body",
    });
  };
};

const login = (validatepassword, get_db) => {
  return async function (req, res) {
    const db = get_db();

    if (req.body) {
      const { username, password } = req.body;

      var exists = await db
        .collection("accounts")
        .findOne({ $or: [{ username: username }, { email: username }] });

      if (exists) {
        var verify = validatepassword(exists.hashedp, password);

        if (verify) {
          return res.json({
            success: jwt.sign(
              {
                username: exists.username,
              },
              secret,
              {
                expiresIn: "2h",
              }
            ),
          });
        }

        return res.json({
          error: "incorrect password",
        });
      }

      return res.json({
        error: "No user with id",
      });
    }

    return res.json({
      error: "invalid request body",
    });
  };
};

module.exports = { author, register, login };
