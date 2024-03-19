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
* Published URL: https://lego-set-collection.onrender.com/
********************************************************************************/

const legoData = require("./modules/legoSets")
const express = require('express')
const path = require('path')
const app = express()
const HTTP_PORT = process.env.PORT || 8080

app.set('view engine', 'ejs');

app.use(express.static("public"))

legoData.initialize().then(()=>{
app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`))
})

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
    const page = '/about';
    res.render("about", { page });
});


app.get('/lego/sets', (req, res) => {
  if (req.query.theme) {
      const theme  = req.query.theme
      legoData.getSetsByTheme(theme).then((data) => {
        res.render("sets", { sets: data, page: '/lego/sets' });
      }).catch((err) => {
        res.status(404).render("404", {message: "No sets found for the specific set number."});
      })
  } else {
      legoData.getAllSets()
      .then((data) => {
        res.render("sets", { sets: data, page: '/lego/sets' });
      })
      .catch((err) => {
        res.status(404).render("404", {message: "No sets found for the specific set number."});
      })
  }
})

app.get('/lego/sets/:setNum', (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
  .then((set) => res.render('set', { sets: [set], page: '/lego/sets/:setNum' })) // Note: Pass `set` or an array containing `set`
  .catch((error) => res.status(404).render('404', { message: "No sets found for the specific set number." }));
});


app.use((req, res) => {
  res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });

});
