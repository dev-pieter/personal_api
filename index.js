const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const MongoClient = require('mongodb').MongoClient
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); 

const url = 'mongodb://127.0.0.1:27017'
dotenv.config();

const dbName = 'personal'
const secret = process.env.TOKEN_SECRET;
const salt = process.env.SALT;
let db

app.use(bodyParser.json());

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  if (err) return console.log(err)

  // Storing a reference to the database so I can use it later
  db = client.db(dbName)
  console.log(`Connected MongoDB: ${url}`)
  console.log(`Database: ${dbName}`)
})

//Auth token verification
function authenticateToken(token){
  if (token == null) return false
  try{
    return jwt.verify(token, secret)
  }
  catch{
    return false
  }

}

//Hash password before adding to database
function hashpassword(password) {
  var hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
  return hash
}

//See if password matches hash (Login)
function validatepassword(hashedpass, pass){
  var newHash = crypto.pbkdf2Sync(pass, salt, 1000, 64, `sha512`).toString(`hex`);
  return hashedpass === newHash
}

//Returns my details for blog use
app.post('/author/', (req, res) => {
    const { token } = req.body

    if(!authenticateToken(token)){
      res.status(201)
      return res.json({
        error : 'token expired'
      })
    }

    db.collection("authors").findOne({name : 'Pieter'} , function(err, result) {
        if (err) throw err;
        res.json(result)
      });
})

//Register user (will mainly be for blog comments)
app.post('/register', async function (req, res) {
  
  if(req.body){
    const {username, password, email} = req.body
    var hashedp = hashpassword(password)

    var exists = await db.collection("accounts").findOne({ $or: [{username : username}, {email: email}] });

    if(exists){
      res.status(201)
      return res.json({
        error : 'user exists'
      })
    }

    var resp = await db.collection("accounts").insertOne({
      username,
      email,
      hashedp
    })
    res.status(200)
    return res.json(resp)
  }

  res.status(201)
  return res.json({
    error : 'invalid request body'
  })
})


app.post('/login', async function (req, res){

  if(req.body){
    const { username, password } = req.body

    var exists = await db.collection("accounts").findOne({ $or: [{username : username}, {email: username}] });

    if(exists){
      var verify = validatepassword(exists.hashedp, password)

      console.log(verify)

      if(verify){
        return res.json({
          success : jwt.sign({
            username : exists.username,
            },
            secret,
            {
              expiresIn: '2h'
            }
          )
        })
      }

      return res.json({
        error: 'incorrect password'
      })
    }

    return res.json({
      error: 'No user with id'
    })
  }

  return res.json({
    error: 'invalid request body'
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})