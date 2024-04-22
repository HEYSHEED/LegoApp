
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema
require('dotenv').config()

let userSchema = new Schema({
    userName: {
      type: String,
      unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
      dateTime: Date,
      userAgent: String
    }]
  })
  
  let User

function initialize() {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })

    db.on('error', (err) => {
      reject(err);
    });

    db.once('open', () => {
      User = db.model("users", userSchema)
      resolve()
    })
  })
}

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
        reject("Passwords do not match")
        return;
    }

    bcrypt.hash(userData.password, 10).then(hash => {
        userData.password = hash;
        let newUser = new User({
            userName: userData.userName,
            password: userData.password, 
            email: userData.email
        })

        newUser.save()
          .then(() => resolve())
          .catch(err => {
              if (err.code === 11000) {
                  reject("User Name already taken")
              } else {
                  reject(`There was an error creating the user: ${err}`)
              }
          })
      }).catch(err => {
          console.log(err); 
          reject("There was an error encrypting the password")
      })
  })
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName }).then(user => {
      if (!user) {
        reject(`Unable to find user: ${userData.userName}`)
        return
      }

      bcrypt.compare(userData.password, user.password).then(result => {
        if (result) {
          let loginAttempt = {
            dateTime: new Date(),
            userAgent: userData.userAgent 
          }
          user.loginHistory.push(loginAttempt)

          user.save().then(() => {
            resolve(user)
          }).catch(err => {
            console.log(err)
            reject("Error updating login history")
          });
        } else {
          reject(`Incorrect Password for user: ${userData.userName}`)
        }
      }).catch(err => {
        console.log(err);
        reject("Error comparing passwords")
      })
    }).catch(err => {
      console.log(err)
      reject(`Error finding user: ${userData.userName}`)
    })
  })
}

module.exports = {
  initialize,
  registerUser,
  checkUser
}