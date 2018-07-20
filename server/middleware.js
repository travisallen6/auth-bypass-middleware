require('dotenv').config()

const imposter = {
    id:1, 
    auth_id:'tinder-oauth2|1337', 
    user_name: 'Ron Swanson',	
    user_pic: 'http://cdn.playbuzz.com/cdn/173e8dc2-5516-41c1-8e34-43bf6f03b6d8/74395ba4-9272-48b1-8d3f-839a0e53cfef_560_420.jpg',
};

module.exports = {
    bypassAuthInDevelopment: (req, res, next) => {
        console.log(process.env.NODE_ENV)
        if(!req.session.user && process.env.NODE_ENV === 'development') {
            req.session.user = imposter
        }
        next();
    }
}