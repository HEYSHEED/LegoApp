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
********************************************************************************/
const legoData = require("./modules/legoSets")
const express = require('express')
const path = require('path')
const app = express()
const HTTP_PORT = process.env.PORT || 8080

app.use(express.static("public"))

legoData.initialize().then(()=>{
app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`))
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"))
})

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"))
})

app.get('/lego/sets', (req, res) => {
  if (req.query.theme) {
      const theme  = req.query.theme
      legoData.getSetsByTheme(theme)
          .then(data => res.json(data))
          .catch(err => {
              console.error(err)
              res.status(404).send(`Sets not found for the theme: ${theme}`)
          })
  } else {
      legoData.getAllSets()
      .then((data) => {
        res.json(data)
      })
      .catch((reason) => {
        console.log(reason)
      })
  }
})

app.get('/lego/sets/:setNum', (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
      .then(data => {
          if (data) {
              res.json(data);
          } else {
              res.status(404).send("Set not found with number: " + setNum);
          }
      })
      .catch(err => {
          console.error(err);
          res.status(404).send("Error finding set with number: " + setNum);
      });

})

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});