/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mahshid Ebrahim Shirazi         Student ID: 168024222        Date: 01/27/2024
*
********************************************************************************/
module.exports = {
  content: [`./views/**/*.html`],
    theme: {
      extend: {
      
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('daisyui'),
    ],
  };
  