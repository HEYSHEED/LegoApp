/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mahshid Ebrahim Shirazi         Student ID: 168024222       Date: 01/27/2024
*
* Published URL: https://real-pear-beaver-garb.cyclic.app
********************************************************************************/
const legoData = require("./modules/legoSets")
const authData = require('./modules/auth-service')
const clientSessions = require('client-sessions')
const express = require('express')
const path = require('path')
const app = express()
const HTTP_PORT = process.env.PORT || 8080

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60,
  })
)

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user || !req.session.user.userName) {
    res.redirect("/login");
  } else {
    next();
  }
}

legoData.initialize()
.then(authData.initialize())
.then(function(){
    app.listen(HTTP_PORT, function(){
      console.log(`server listening on: ${HTTP_PORT}`)
    })
}).catch(function(err){
    console.log(`unable to start server: ${err}`)
})

app.get('/', (req, res) => {
  res.render("home")
})

app.get('/about', (req, res) => {
  res.render("about")
})

app.get('/lego/sets', (req, res) => {
  if (req.query.theme) {
      const theme  = req.query.theme
      legoData.getSetsByTheme(theme).then((data) => {
        res.render("sets", { sets: data})
      }).catch((err) => {
        res.status(404).render("404", {message: err})
      })
  } else {
      legoData.getAllSets()
      .then((data) => {
        res.render("sets", {sets: data});
      })
      .catch((err) => {
        res.status(404).render("404", {message: err})
      })
  }
})

app.get('/lego/sets/:setNum', (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
      .then(data => {
        res.render("set", {set: data})
      })
      .catch(err => {
        res.status(404).render("404", {message: err})
      })
})

app.get('/lego/addSet', ensureLogin, (req, res) => {
    legoData.getAllThemes()
        .then((themes) => {
            res.render("addSet", { themes: themes })
        })
        .catch((error) => {
          res.render("500", { 
            message: `I'm sorry, but we have encountered the following error: ${err.message}` })
        })
})

app.post('/lego/addSet', ensureLogin, (req, res) => {
  legoData.addSet(req.body)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch((err) => {
        res.render("500", {
          message: `I'm sorry, but we have encountered the following error: ${err}`
        })
      })
})

app.get('/lego/editSet/:num', ensureLogin, (req, res) => {
  const setNum = req.params.num;
  legoData.getSetByNum(setNum)
    .then(set => {
      if (!set) {
        throw new Error('Set not found');
      }

      legoData.getAllThemes()
        .then(themes => {
          res.render('editSet', { set, themes });
        })
        .catch(themesErr => {
          throw themesErr;
        });
    })
    .catch(err => {
      res.status(404).render('404', { message: err.message || 'Unable to find the requested set or themes.' });
    });
});

app.post('/lego/editSet', ensureLogin, (req, res) => {
  const setNum = req.body.set_num;
  const setData = req.body;

  legoData.editSet(setNum, setData)
    .then(() => {
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.render('500', { 
        message: `I'm sorry, but we have encountered the following error: ${err.message || 'An unexpected error occurred.'}` 
      });
    });
});

app.get("/lego/deleteSet/:num", ensureLogin, (req, res) => {
  legoData.deleteSet(req.params.num)
      .then(() => {
          res.redirect("/lego/sets")
      })
      .catch(err => {
          res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` })
      })
})

app.get('/register', (req, res) => {
  res.render('register'); 
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body).then(() => {
    res.render('register', { successMessage: "User created" })
  }).catch(err => {
    res.render('register', { errorMessage: err, userName: req.body.userName })
  })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent')
  authData.checkUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    }
    res.redirect('/lego/sets')
  }).catch(err => {
    res.render('login', { errorMessage: err, userName: req.body.userName })
  })
})

app.get('/logout', (req, res) => {
  req.session.reset()
  res.redirect('/')
})

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory')
})

app.use((req, res) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"})
})