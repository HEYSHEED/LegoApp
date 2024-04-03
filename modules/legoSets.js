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

require('dotenv').config();
const Sequelize = require('sequelize');

// Define Sequelize instance
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

// Define Theme model
const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: Sequelize.STRING
}, {
    timestamps: false
});


// Define Set model
const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING
}, {
    timestamps: false
});

// Define association between Set and Theme
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function getAllSets() {
    return new Promise((resolve, reject) => {
        Set.findAll({ include: [Theme] })
            .then((sets) => {
                resolve(sets);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        Set.findAll({ 
            where: { set_num: setNum },
            include: [Theme] 
        })
            .then((sets) => {
                if (sets.length > 0) {
                    resolve(sets[0]);
                } else {
                    reject("Unable to find requested set");
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}
function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        Set.findAll({ 
            include: [Theme],
            where: { 
                '$Theme.name$': {
                    [Sequelize.Op.iLike]: `%${theme}%`
                }
            }
        })
            .then((sets) => {
                if (sets.length > 0) {
                    resolve(sets);
                } else {
                    reject("Unable to find requested sets");
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}
function addSet(setData) {
    return new Promise((resolve, reject) => {
        Set.create(setData)
            .then(() => resolve())
            .catch((err) => reject(err.errors[0].message));
    });
}
function editSet(setNum, setData) {
    return new Promise((resolve, reject) => {
        Set.update(setData, {
            where: { set_num: setNum }
        })
            .then(() => resolve())
            .catch((err) => reject(err.errors[0].message));
    });
}
function deleteSet(set_num) {
    return new Promise((resolve, reject) => {
        Set.destroy({
            where: {
                set_num: set_num
            }
        })
        .then((rowsDeleted) => {
            if (rowsDeleted > 0) {
                resolve();
            } else {
                reject("No set found with the provided set number.");
            }
        })
        .catch((err) => {
            reject(err.errors[0].message);
        });
    });
}
function getAllThemes() {
    return new Promise((resolve, reject) => {
        Theme.findAll()
            .then((themes) => resolve(themes))
            .catch((err) => reject(err));
    });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, editSet, deleteSet, getAllThemes };
