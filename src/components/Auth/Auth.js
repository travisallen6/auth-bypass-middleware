import React from 'react';

export default function Auth() {
    function login() {
        let { REACT_APP_DOMAIN, REACT_APP_CLIENT_ID } = process.env;
        
        let redirectUri = encodeURIComponent(`http://localhost:3005/auth/callback`);
        
        window.location = `https://${REACT_APP_DOMAIN}/authorize?client_id=${REACT_APP_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=${redirectUri}&response_type=code`;
    }
    
    return (
        <div>
            <h1>Please Login</h1>
            <button onClick={login}>Login</button>
        </div>
    )
}