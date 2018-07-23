const tableMsg = require('chalk').gray.bgCyan

module.exports = {
    bootstrapDB: (db) => {
        db.init.check_for_users_table()
       .then( ([{exists}]) => {
            if(!exists) {
                db.init.user_seed()
                .then( () => {
                    console.log( tableMsg('Example Table "auth_bypass_users" Created - Drop table from DB once you are finished with this example.' ))
                    db.init.check_for_favorites_table()
                    .then( ([{exists}]) => {
                        if(!exists) {
                            db.init.favorites_seed()
                            .then( () => {
                                console.log( tableMsg( 'Example Table "auth_bypass_favorites" Created - Drop table from DB once you are finished with this example.' ))
                            }) .catch( err => console.log( err ))
                        } else {
                            console.log( tableMsg('Example Table "auth_bypass_favorites" Already Exists - Drop table from DB once you are finished with this example.'))
                        }
                    })
                })
                .catch( err => console.log( err ))
            } else {
                console.log( tableMsg('Example Table "auth_bypass_users" Already Exists - Drop table from DB once you are finished with this example.'))
                db.init.check_for_favorites_table()
                .then( ([{exists}]) => {
                    if(!exists) {
                        db.init.favorites_seed()
                        .then( () => {
                            console.log( tableMsg( 'Example Table "auth_bypass_favorites" Created - Drop table from DB once you are finished with this example.' ))
                        }) .catch( err => console.log( err ))
                    } else {
                        console.log( tableMsg('Example Table "auth_bypass_favorites" Already Exists - Drop table from DB once you are finished with this example.'))
                    }
                })
            }
       })
       .catch( err => {
            console.log(err)
       })
    },

    cleanupDB: (req, res) => {
        req.app.get('db').cleanup.drop_example_tables()
        .then( () => {
            res.sendStatus(200)
            console.log('Database example tables have been dropped')
            return Promise.resolve('Dropped')
        })
        .then( (response) => {
            console.log('Nodemon will now exit. Do not start nodemon in this project again or example tables will be created again.')
        })
        .catch(err => console.log(err))
    },

    killProcess: (req, res) => {
        process.exit()
    }
}