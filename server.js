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
* Published URL: https://real-pear-beaver-garb.cyclic.app/
********************************************************************************/
const legoData = require("./modules/legoSets");
const express = require('express');
const path = require('path');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

legoData.initialize().then(() => {
    app.listen(HTTP_PORT, () => console.log(`server listening on: ${HTTP_PORT}`));
});

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    const page = '/about';
    res.render("about", { page });
});

app.get('/lego/sets/:setNum', (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
  .then((set) => res.render('set', { sets: [set], page: '/lego/sets/:setNum' })) // Note: Pass `set` or an array containing `set`
  .catch((error) => res.status(404).render('404', { message: "No sets found for the specific set number." }));
});

app.get('/lego/addSet', (req, res) => {
    legoData.getAllThemes()
        .then((themes) => {
            res.render("addSet", { themes: themes });
        })
        .catch((error) => {
            res.status(500).render("500", { message: "Internal Server Error" });
        });
});

app.post('/lego/addSet', (req, res) => {
    const setData = {
        name: req.body.name,
        year: parseInt(req.body.year),
        num_parts: parseInt(req.body.num_parts),
        img_url: req.body.img_url,
        theme_id: parseInt(req.body.theme_id),
        set_num: req.body.set_num
    };
    legoData.addSet(setData)
        .then(() => {
            res.redirect('/lego/sets');
        })
        .catch((err) => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.get('/lego/sets', (req, res) => {
    if (req.query.theme) {
        const theme = req.query.theme;
        legoData.getSetsByTheme(theme)
            .then((data) => {
                res.render("sets", { sets: data, page: '/lego/sets' });
            })
            .catch((err) => {
                res.status(404).render("404", { message: "No sets found for the specific set number." });
            });
    } else {
        legoData.getAllSets()
            .then((data) => {
                res.render("sets", { sets: data, page: '/lego/sets' });
            })
            .catch((err) => {
                res.status(404).render("404", { message: "No sets found for the specific set number." });
            });
    }
});

app.get('/lego/editSet/:num', (req, res) => {
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
            // If fetching themes fails
            throw themesErr;
          });
      })
      .catch(err => {
        res.status(404).render('404', { message: err.message || 'Unable to find the requested set or themes.' });
      });
  });

  app.post('/lego/editSet', (req, res) => {
    const setNum = req.body.set_num;
    const setData = req.body;
  
    legoData.editSet(setNum, setData)
      .then(() => {
        res.redirect('/lego/sets');
      })
      .catch(err => {
        console.error(err);
        res.render('500', { 
          message: `I'm sorry, but we have encountered the following error: ${err.message || 'An unexpected error occurred.'}` 
        });
      });
  });
  
app.get('/lego/deleteSet/:num', (req, res) => {
  const setNum = req.params.num;
  legoData.deleteSet(setNum)
      .then(() => {
          res.redirect('/lego/sets');
      })
      .catch((err) => {
          res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
      });
});
app.use((req, res) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" });
});
