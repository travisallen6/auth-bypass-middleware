require('dotenv').config();
const express = require('express')
    , massive = require('massive')
    , chalk = require('chalk')
    , mid = require('./middleware')
    , ctrl = require('./controller')
    , session = require('express-session')
    , dU = require('./dbUtils');

const {
    SERVER_PORT,
    CONNECTION_STRING,
    SESSION_SECRET
} = process.env

let app = express();

app.use( express.json() );

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

massive( CONNECTION_STRING )
.then( db => {
    console.log( chalk.magenta('Database Connected') );
    app.set( 'db', db )
    dU.bootstrapDB(db)
})

// app.use(mid.bypassAuthInDevelopment({
//     id:45, 
//     auth_id:'tinder-oauth2|1337', 
//     user_name: 'Ron Swanson',	
//     user_pic: 'http://cdn.playbuzz.com/cdn/173e8dc2-5516-41c1-8e34-43bf6f03b6d8/74395ba4-9272-48b1-8d3f-839a0e53cfef_560_420.jpg',
// }))

// app.use(mid.bypassAuthInDevelopmentWithDB(1))

app.get('/auth/callback', ctrl.authCallback)

app.get('/api/user', ctrl.authCheck)

app.get('/api/logout', ctrl.logout)

app.route('/api/favorites')
    .get(ctrl.getFavorites)
    .post(ctrl.addFavorite)

app.get('/cleanupdb', dU.cleanupDB)
app.get('/killprocess', dU.killProcess)


app.listen( SERVER_PORT, () => console.log( chalk.cyan.underline(`Hard to port ${SERVER_PORT}`) ))