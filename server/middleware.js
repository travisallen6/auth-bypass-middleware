require('dotenv').config()

const chalk = require('chalk')
const nodeEnv = chalk.gray.bgGreen

const imposter = {
    id:2, 
    auth_id:'tinder-oauth2|1337', 
    user_name: 'Ron Swanson',	
    user_pic: 'http://cdn.playbuzz.com/cdn/173e8dc2-5516-41c1-8e34-43bf6f03b6d8/74395ba4-9272-48b1-8d3f-839a0e53cfef_560_420.jpg',
};

module.exports = {
    bypassAuthInDevelopment: (req, res, next) => {
        // This function uses the hard-coded user object above to set to req.session.user
        console.log(nodeEnv(`NODE_ENV: ${process.env.NODE_ENV}`))
        if(!req.session.user && process.env.NODE_ENV === 'development') {
            req.session.user = imposter
        }
        next();
    },
    bypassAuthInDevelopmentWithDB: (req, res, next) => {
        // ============================================================================================ //
        // Change id below to the id of the user from your database that you want to be logged in with  //
        /* ================================== */ const userId = 1 /* ================================== */ 
        // ============================================================================================ //

        // This function queries the database by an id that you pass in to the massive function that corresponds with the primary key id of a user in your database.
        console.log(nodeEnv(`NODE_ENV: ${process.env.NODE_ENV}`))
        if(!req.session.user && process.env.NODE_ENV === 'development') {
           req.app.get('db').find_user_by_id([userId])
           .then( user => {
               if(user.length > 0) {
                   req.session.user = user[0]
                   next()
               } else {
                   // If there is no user returned from the database, the hard-coded user object will be set to the session.
                   req.session.user = imposter
                   next()
               }
           })
           .catch( err => console.log(err))
        } else {
            next()
        }
    }
}