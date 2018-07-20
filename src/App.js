import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { HashRouter, Switch, NavLink, Route } from 'react-router-dom'
import Auth from './components/Auth/Auth'
import Profile from './components/Profile/Profile'

class App extends Component {
  render() {
    return (
      <HashRouter>
        <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h1 className="App-title">Auth Bypass Demo</h1>
              <NavLink className='nav-link' to='/'>Home</NavLink>
              <NavLink className='nav-link' to='/profile'>Profile</NavLink>
            </header>
            <section>
                <Switch>
                  <Route exact path='/' component={Auth} />
                  <Route exact path='/profile' component={Profile} />
                </Switch>
            </section>
        </div>
      </HashRouter>
    );
  }
}

export default App;
