require('dotenv').config()
const axios = require('axios')

const {
    REACT_APP_CLIENT_ID,
    REACT_APP_DOMAIN,
    CLIENT_SECRET
} = process.env

module.exports = {
    authCallback: async (req, res) => {
    
        let payload = {
            client_id: REACT_APP_CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: req.query.code,
            grant_type: 'authorization_code',
            redirect_uri: `http://${req.headers.host}/auth/callback`
        };
    
       
        let responseWithToken = await axios.post(`https://${REACT_APP_DOMAIN}/oauth/token`, payload);
        
        let userData = await axios.get(`https://${REACT_APP_DOMAIN}/userinfo?access_token=${responseWithToken.data.access_token}`);
    
        const db = req.app.get('db');
        let {sub, name, picture} = userData.data;
        let userExists = await db.find_user([sub])
        if(userExists[0]) {
            req.session.user = userExists[0];
            res.redirect('http://localhost:3000/#/profile');
        } else {
            db.create_user([sub, name, picture]).then( createdUser => {
                req.session.user = createdUser[0];
                res.redirect('http://localhost:3000/#/profile');
            })
        }
    
    },

    authCheck: (req, res)=>{
        if(req.session.user) {
            return res.status(200).send(req.session.user)
        } else {
            return res.status(401).send('Prohibidabido')
        }
    },

    logout: (req, res) => {
        req.session.destroy()
        res.redirect('http://localhost:3000/#/')
    },

    addFavorite: (req, res) => {
        const { id } = req.session.user
        const { text } = req.body
       req.app.get('db').add_user_favorite([id, text])
       .then( favorites => res.send(favorites))
       .catch( err => console.log(err) )
    },

    getFavorites: (req, res) => {
        req.app.get('db').get_user_favorites([req.session.user.id])
        .then( favorites => res.send(favorites))
        .catch( err => {
            if(!req.session.user) {
                res.status(500).send('No user on req.session.user. This is caused when a user is not "logged in"')
            } else {
                console.log(err)
                res.status(500).send(err.stack)
            }
        })
    }
}