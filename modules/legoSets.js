/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mahshid Ebrahim Shirazi
   Student ID: 168024222
   Date: 1st Feb.
*
********************************************************************************/


const setData = require("../data/setData");
const themeData = require("../data/themeData");
let sets = []; 


function initialize(){
    return new Promise((resolve, reject) => {
        setData.forEach(element => {
            const matchSet = themeData.find((index) => index.id === element.theme_id)
            if (matchSet) {
                element.theme = matchSet.name
                sets.push(element)
              }
        })

        if(sets){
            resolve(sets)
        }else{
            reject("Array is empty")
        }
    })
}

function getAllSets(){
    return new Promise((resolve)=>{
        if(sets){
            resolve(sets)
        }else{
            reject("err")
        }
    })
}
function getSetByNum(setNum){
    return new Promise((resolve,reject)=>{
        const matchingObject = sets.find((element)=> element.set_num===setNum)
        if(matchingObject){
            resolve(matchingObject)
        }else{
            reject("unable to find requested set")
        }
    }

    )

}
function getSetsByTheme(theme){
    return new Promise((resolve, reject) => {
        let resultSet = sets.filter(element => element.theme.toLowerCase().includes(theme.toLowerCase()));
        if(resultSet){
            resolve(resultSet)
        }else{
            reject("unable to find requested set")
        }
    })
}
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme }