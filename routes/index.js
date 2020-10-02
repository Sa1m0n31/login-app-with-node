var express = require('express');
var router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lolpol',
  database: "nodelogin"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  connection.query("CREATE TABLE IF NOT EXISTS users (login VARCHAR(255), password VARCHAR(255))", (err, res) => {
    if(err) throw err;
    else console.log(res);
  });
  console.log(req.session.loggedIn);
  if(req.session.loggedIn) {
    console.log("Redirect!!!");
    res.redirect("/home");
  }
  else {
    res.render('index');
  }
});

/* Login */
router.post("/auth", (req, res) => {
  const username = req.body.login;
  const password = req.body.password;

  // simple query
  connection.query("SELECT * FROM users WHERE login = ?", [username],(err, result) => {
    if(err) throw err;
    else {
      if(result.length > 0) {
        bcrypt.compare(password, result[0].password)
            .then((passwordOk) => {
              console.log("Comparing... result: " + passwordOk);
              passwordOk ? req.session.loggedIn = true : req.session.loggedIn = false;
            })
            .then(() => { res.redirect("/home"); })
      }
      else {
        console.log("Failed " + result);
        req.session.loggedIn = false;
        res.redirect("/home");
      }
    }
  });
});

router.get("/home", (req, res, next) => {
  if(req.session.loggedIn) {
    res.render('home');
  }
  else {
    res.redirect("/");
  }
});

router.get("/logout", (req, res, next) => {
  req.session.loggedIn = false;
  res.redirect("/");
});

/* Register */
router.get("/register", (req, res) => {
  res.render('register');
});

router.post("/register/auth", (req, res) => {
  const username = req.body.login;
  const password = req.body.password;
  const repeatPassword = req.body.repeatPassword;

  if(password === repeatPassword) {
    bcrypt.hash(password, 10, (err, hash) => {
      connection.query("INSERT INTO users (login, password) VALUES (?, ?)", [username, hash], (err, results) => {
        if(err) throw err;
        else console.log(results);
      });
      req.session.userCreated = true;
      res.redirect("/user-created");
    });
  }
  else {
    res.redirect("/register");
  }
});

router.get("/user-created", (req, res) => {
  if(req.session.userCreated) {
    req.session.userCreated = false;
    res.render("user-created");
  } else {
    res.redirect("/");
  }
});

module.exports = router;
