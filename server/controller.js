require('dotenv').config()

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
            res.status(200).send(req.session.user)
        } else {
            res.status(401).send('Prohibidabido')
        }
    },

    logout: (req, res) => {
        req.session.destroy()
        res.redirect('http://localhost:3000/#/')
    },

    addFavorite: (req, res) => {
        if(!req.session.user){
            return res.status(401).send('I don\'t know who you are, so I cant add this favorite to the database')
        } else {
            req.app.get('db')
        }
    }


}