# Auth Bypass Middleware

## Setup

### Install Dependencies
1. CD into your project
1. Run `npm install`

### Create a .env
Create a .env file at the root of the project. Paste the following properties into the file: 
```
REACT_APP_DOMAIN=
REACT_APP_CLIENT_ID=
CLIENT_SECRET=
CONNECTION_STRING=
SESSION_SECRET=
SERVER_PORT=3005
```

### Auth0
Add credentials from Auth0 to your .env. You can use an existing application's credentials or you can create a new application. You can view the credentials by following these steps:
1. Go to https://manage.auth0.com
1. Either click new application on the top right and follow the steps to create a new application, or click the 'applications' link on the left hand menu.
1. Click the name of the application that you would like to use for the example. 
1. Copy the following properties to your .env. Make sure to use the exact property name for the app to work properly out of the box.
  - Paste the Domain into the `REACT_APP_DOMAIN=`
  - Paste the Client ID into the `REACT_APP_CLIENT_ID=` field.
  - Paste the Client Secret into the `CLIENT_SECRET=` field.
1. Ensure that you add a proper callback url in the 'Allowed Callback URLs' text field.
  - The endpoint that has been set up to handle the Auth0 callback is at `http://localhost:3005/auth/callback`. If you would like to use a different port for your server, be sure to replace 3005 with the server port you will be using. If you modify the port, you will likely need to update code in the project for the example to work properly.

### Database
Add your database connection string to your .env under the `CONNECTION_STRING=` field. You can use an existing or new database for this example. There is code in the server massive setup that will automatically create the tables necessary for the example. Once you are all finished with the example, you can click the `Cleanup DB` link (http://localhost:3000/#/cleanup) to automatically drop the tables and exit the node/nodemon process. Once the process exits, do not restart the node/nodemon process inside this project to prevent the tables from being created again.

### Session Secret
Add a random string of characters to your .env under the `SESSION_SECRET=` field. Something long and random is preferable, but anything will do.

### Server Port
It is suggested that you use port 3005 so that you don't have to modify any code on the front end to get the auth0 process started.

### nodemon.json
This file has been included in this project already. I suggest that you keep this file in a folder with your other tooling/configuration files like a reset.css file etc. This file configures nodemon to ignore certain files/folders, specifically watch certain files/folders, and it will also set an environmental variable any time nodemon runs. We can leverage this environmental variable to determine whether your code is being run in a development or production environment. Long story short, the nodemon.json is an important part of this technique being successful, but I will explain how we leverage this feature later on.

### .env recap
```
CONNECTION_STRING= // string from heroku - add ?ssl=true to the end
REACT_APP_DOMAIN= // Domain from auth0
REACT_APP_CLIENT_ID= // Client ID from auth0
CLIENT_SECRET= // Client Secret from auth0
SESSION_SECRET= // Random string of characters
SERVER_PORT=3005 // I don't suggest changing this.
```

## The Problem

Incorporating authentication into an application allows us to create a personalized experience for each of our users. As we start to incorporate authentication into an app, we find out that several components become dependent on aspects of the user's session. As we develop and debug we need to log in over and over again to prevent the parts of our app that use user data on a session from breaking. In doing so, we waste tons of time and the mounting levels of frustration erode our coding and debugging ability.

### Demonstrating the Problem
1. Open a terminal and run `nodemon` in the root of the project directory.
1. Open a second terminal and run `npm start` in the root of the project directory.
1. Before logging in, click the profile link in the header.
1. You should quckly get a javascript alert with an error. This is because this component is sending a request to the server for user information. The server checks `req.session.user` for this data which is undefined since we didn't log in.
1. Go back to the login screen and log in using one of the social providers from auth0.
1. Once you login, you should be redirected to the profile view. You should now see your profile information and avatar populate on the left hand card of the profile view.
1. You can now add items to your list of favorite things. Submitting the input will insert a row into favorites table that has a foreign key dependant on the id of the user that added it.
  - If you were to log out, and log in with a different user, the list of favorites would be blank, and you can add a seperate list unique to the newly logged-in user. I'll let you decide whether it is worth logging in with a new user to prove that.
1. Now restart your nodemon process by typing `rs` into the terminal that is running nodemon. This is to simulate your nodemon process restarting after you have modified code in your server files and nodemon restarting after you save.
1. Refresh your browser. The user data is now gone since all of the session data has been cleared from the session store and you should now see that the error is back. How frustrating! The only way to get back to a working state is to go back to the home screen and log in again. There has to be a better way! Lucky for us, there is. Read on for a solution to this annoying problem.

## The Solution

### Key Components of the Solution

#### Session
Sessions allow us to create a unique experience for each of our users using cookies. Generally, when a user logs into our application, we retreive their user data from a database and place that information on the user's session. Using session middleware, we can then retrieve their user data any time that they interact with endpoints on the server. The downside is that a user's session doesn't survive a server restart which happens a lot during development.

#### Middleware
Middleware is an awesome feature in express (but is certainly not a concept exclusive to express) that allows us to run one or more functions before the final controller function responds to an http request. Middleware is commonly used to protect endpoint data based on authentication or access levels, but it is also useful in several other use-cases as well.

#### app.use(middlewareFunction)
We are able to designate a middleware function to run before every endpoint defined below it. This is a key component of being able to bypass authentication

### Putting It All Together
We can write custom middleware that will run before each of our endpoints using express's app.use() function. This middleware will first check if we are in a development environment by checking the NODE_ENV variable on the node process object. `process.env.NODE_ENV` should be defined as "development" if we are running nodemon while using a nodemon.json in our root directory. Our middleware function will also check if there is already a user defined on the session. If there is already a user defined on the session, or the NODE_ENV environmental variable is undefined, we do not want our middleware function to modify the session. This will ensure that if we do decide to log in, or if our app is running in production, that the middleware function will not interfere with the session.

### The Functions
Take a look at `/server/middleware.js`. At the top, we are requiring dotenv so we have access to our environmental variables in this file. You will then see that we set up a library called chalk that will color our NODE_ENV console.logs for a demonstration later on.  We are then exporting two functions: bypassAuthInDevelopment, and bypassAuthInDevelopmentWithDB. We will only use one of these functions at any given time to determine what data will be used as the user's user object on req.session.

In the **bypassAuthInDevelopment** method, it accepts an object as a parameter that has all of the properties that we want to be put on req.session.user prior to each of our endpoint running.

##### server/middleware.js
```
  bypassAuthInDevelopment: (userObject) => {
        return function (req, res, next) {
            // This function sets the data from the parameter to req.session.user
            console.log(chalkEnv(`NODE_ENV: ${process.env.NODE_ENV}`))
            if(!req.session.user && process.env.NODE_ENV === 'development') {
                req.session.user = userObject
            }
            next();
        }
    },
```
This method is called with an object of desired user data in server.js
##### server/server.js
```
app.use(mid.bypassAuthInDevelopment({
    id:45, 
    auth_id:'tinder-oauth2|1337', 
    user_name: 'Ron Swanson',	
    user_pic: 'http://cdn.playbuzz.com/cdn/173e8dc2-5516-41c1-8e34-43bf6f03b6d8/74395ba4-9272-48b1-8d3f-839a0e53cfef_560_420.jpg',
}))
```

The second method: **bypassAuthInDevelopmentWithDB** accepts a single parameter, the id of the user form our database that we want to be "logged in". This method will query the user database and return a single user with the corresponding id passed in. All of the resulting data will be placed on req.session.user prior to each endpoint executing.

##### server/middleware.js
```
 bypassAuthInDevelopmentWithDB: (userID) => {
  return function(req, res, next) {
      // This function queries the database by the ID passed into the outer function id that you pass in to the massive function that corresponds with the primary key id of a user in your database, that you would like to always be "logged in"
      console.log(chalkEnv(`NODE_ENV: ${process.env.NODE_ENV}`))
      if(!req.session.user && process.env.NODE_ENV === 'development') {
      req.app.get('db').find_user_by_id([userID])
      .then( user => {
          if(user.length > 0) {
              req.session.user = user[0]
              next()
          } else {
              // If there is no user returned from the database, the hard-coded user object will be set to the session.
              req.session.user = imposter
              next()
          }
      })
      .catch( err => console.log(err))
      } else {
          next()
      }
  }
}
```
This method is invoked in server.js with the id of the user in the database that will be set on req.session.

##### server/server.js
```
app.use(mid.bypassAuthInDevelopmentWithDB(1))
```

Both Methods are forcing data onto req.session.user prior to each endpoint running, they are just sourcing the data differently.

### Demonstration of Solution Middleware

#### BypassAuthInDevelopment
1. If you aren't already running nodemon and your front-end dev server, run nodemon in one terminal and run npm start in another.
1. Without logging in, click profile. You should immediately get an error since req.session.user is undefined because you didn't log in.
1. Uncomment line 33-38 in server.js and save.
1. Make sure you see `Database Connected` in your nodemon terminal before moving on. 
1. Refresh the page.
1. You will now see that Ron Swanson is now "logged in". 
1. Look at the terminal running nodemon. You should see `NODE_ENV: development` with a green background behind it. In the middleware we are logging the variable `process.env.NODE_ENV`. Since we are running nodemon this varaible is defined as "development".
1. Kill your nodemon process in the terminal
1. Run the command `node server/server.js`
1. Make sure to wait until `Database Connected` logs in your terminal before proceeding to the next step.
1. Refresh your browser. You should immediately get an error alert on the front end like you did before. Also, you should see that NODE_ENV is now logging undefined in your terminal. Since we are running node, just like you will on a production server, this variable is undefined and the middleware function never forces a user object onto the session. This is exactly what we want this function to do in production. Users should actually need to log in when this app is running in production.

#### bypassAuthInDevelopmentWithDB(1)
Let's take a look at our second middleware option which will directly query the database for the data to be put on req.session.user.
1. Comment out lines 33-38 in server/server.js.
1. Uncomment line 40 and save.
 - This function is invoked with the user id of 1. You may need to double check that you have a user with an ID of 1 in your `auth_bypass_users` table using sql tabs.  If you want to log in a different user than user #1, replace the number 1  with the id that you want to use instead.  
  - If you don't have a user in your database. Make sure you log in using auth0 by going back to the home page and logging in.
1. Make sure to wait until `Database Connected` logs in your terminal before proceeding to the next step.
1. Refresh your browser
1. You should no longer see Ron Swanson logged in, but instead the user from the database with the ID you specified should now be logged in.

## Cleanup
Click the 'Cleanup DB' link in the header and read the instructions on the page. Clicking the red button will send a request to a server endpoint that will drop the two tables that were automatically created for this example. Once the tables are dropped, your node/nodemon process will exit. Avoid restarting node/nodemon in this project after the process exits or the example tables will be created again.