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
            favInput: '',
            favorites: []
         }
    }

    componentDidMount() {
        axios.get('/api/user')
        .then( user => {
            console.log(user.data)
            axios.get('/api/favorites')
            .then( favorites => {
                console.log()
                this.setState({
                    user: user.data,
                    favorites: favorites.data,
                    favInput: ''
                })
            })
            .catch( err => {
               alert(`${err} \n If you didn't log in, you are getting this error because your request to get the favorites for the current user is failing because req.session.user is undefined. If you check your server's console, you should see 'TypeError: Cannot read property 'id' of undefined'. If you uncomment the `)
            })
        })
        .catch( err => {
            alert(`${err} \n If this error is a 401, that is because this component is sending a request to the server to check for a currently authenticated user but there is no user currently logged in. If you had logged in previously, it's pretty common to lose your session as a result of restarting the server which happens a lot when you are developing on your server.`)
        })
       
    }

    submitFavorite = (e) => {
        e.preventDefault()
        const {favInput} = this.state
        axios.post('/api/favorites', {
            text: favInput
        }).then( favorites => {
            this.setState({ favorites: favorites.data })
        }).catch( err => {
            console.log(err)
        })
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
                        <input value={ this.state.favInput } onChange={this.handleInput} type="text"/>
                        <button type="submit">
                            Add Favorite
                        </button>
                    </form>
                    <ul className='profile-list'>
                        { this.state.favorites.map( fav => <li key={ fav.id }> { fav.favorite_text } </li>) }
                    </ul>
                </div>
            </div>
         );
    }
}
 
export default Profile;