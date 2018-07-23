import React from 'react';
import axios from 'axios'
import './Cleanup.css'

export default function Cleanup(props) {
    
    function cleanupDB(){
        axios.get('/cleanupdb')
        .then( (response) => {
            alert('Your database has been cleaned up. All example tables have been removed. Your node or nodemon process should have stopped. Avoid restarting node or nodemon to prevent the example database tables from being built again.')
            axios.get('/killprocess')
        })
        .catch( err => {
            console.log(err)
        })
    }

    return (
        <div className="cleanup-container">
            <div className="cleanup-card">
                <h1>Database Cleanup</h1>
                <p>
                    Two example tables were automatically created in the database designated in your .env to properly demonstrate how the auth bypass middleware works. Click the button below to automatically drop those two tables and exit your node/nodemon process. Do not start node or nodemon in this project or the two example tables will be added to your database again.
                </p>
                <button onClick={cleanupDB}>Do It</button>
            </div>
        </div>
    )
}