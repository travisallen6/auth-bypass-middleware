import React, { Component } from 'react';
import axios from 'axios'
import './Profile.css'

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            user: {
                id: '',
                auth_id: '',
                user_name: '',
                user_pic: 'http://via.placeholder.com/150x150'
            },
            favInput: ''
         }
    }

    componentDidMount() {
        axios.get('/api/user-data')
        .then( user => this.setState({user: user.data}))
        .catch( err => {
            console.log(err)
        })
    }

    handleSubmit = (e) => {
        const {favInput} = this.state
        e.preventDefault()
        axios.post('/api/favorites', )
    }

    handleInput = (e) => {
        this.setState({
            favInput: e.target.value
        })
    }

    render() { 

        const {
            auth_id,
            id,
            user_name,
            user_pic
        } = this.state.user

        return ( 
            <div className='profile-container'>
                <div className="profile-card">
                    <h2>Profile</h2>
                    <img src={user_pic} width='150px'/>
                    <div className='profile-text'>
                        <h3>ID: { id }</h3>
                        <h3>Username: { user_name }</h3>
                        <h3>Auth ID: { auth_id }</h3>
                    </div>
                </div>
                <div className="profile-card">
                    <h2>Favorites</h2>
                    <form onSubmit={this.submitFavorite}>
                        <input onChange={this.handleInput} type="text"/>
                        <button type="submit">
                            Add Favorite
                        </button>
                    </form>
                </div>
            </div>
         );
    }
}
 
export default Profile;