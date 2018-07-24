require('dotenv').config()

const chalkEnv = require('chalk').gray.bgGreen

module.exports = {

    bypassAuthInDevelopment: (userObject) => {
        return function (req, res, next) {
            // This function sets the data from the parameter to set to req.session.user
            console.log(chalkEnv(`NODE_ENV: ${process.env.NODE_ENV}`))
            if(!req.session.user && process.env.NODE_ENV === 'development') {
                req.session.user = userObject
            }
            next();
        }
    },

    bypassAuthInDevelopmentWithDB: (userID) => {
    
        return function(req, res, next) {

            // This function queries the database by the ID passed into the outer function id that you pass in to the massive function that corresponds with the primary key id of a user in your database, that you would like to always be "logged in"
            console.log(chalkEnv(`NODE_ENV: ${process.env.NODE_ENV}`))
            if(!req.session.user && process.env.NODE_ENV === 'development') {
            req.app.get('db').find_user_by_id([userID])
            .then( user => {
                if(user.length > 0) {
                    req.session.user = user[0]
                    next()
                } else {
                    // If there is no user returned from the database, throw an error.
                    next(new Error('No user found in database to place on req.session.user'))
                }
            })
            .catch( err => console.log(err))
            } else {
                next()
            }
        }
    }
}