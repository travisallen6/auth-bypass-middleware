# Auth Bypass Middleware

## Setup

### Install Dependencies
1. CD into your project
1. Run `npm install`

### Auth0
Add credentials from Auth0. You can use an existing application's credentials or you can create a new application. You can view the credentials by following these steps:
1. Go to https://manage.auth0.com
1. Either click new application on the top right and follow the steps to create a new application, or click the 'applications' link on the left hand menu.
1. Click the name of the application that you would like to use for the example. 
1. Copy the following properties to your .env. Make sure to use the exact property name for the app to work properly out of the box.
  - Paste the Domain into the `REACT_APP_DOMAIN=`
  - Paste the Client ID into the `REACT_APP_CLIENT_ID=` field.
  - Paste the Client Secret into the `CLIENT_SECRET=` field.
1. Ensure that you add a proper callback url in the 'Allowed Callback URLs' text field.
  - The endpoint that has been set up to handle the Auth0 callback is at `http://localhost:3005/auth/callback`. If you would like to use a different port for your server, be sure to replace 3005 with the server port you will be using.

### Database
Add your database connection string to your .env under the `CONNECTION_STRING=` field. You can use an existing or new database for this example. There is code in the server massive setup that will automatically create the tables necessary for the example. Once you are all finished with the example, you can click the `Cleanup DB` link (http://localhost:3000/#/cleanup) to automatically drop the tables and exit the node/nodemon process. Once the process exits, do not restart the node/nodemon process inside this project to prevent the tables from being created again.

### Session Secret
Add a random string of characters to your .env under the `SESSION_SECRET=` field. Something long and random is preferable, but anything will do.

### Server Port
It is suggested that you use port 3005 so that you don't have to modify any code on the front end to get the auth0 process started.

### nodemon.json
This file has been included in this project already. I suggest that you keep this file in a folder with your other tooling/configuration files like a reset.css file etc. This file configures nodemon to ignore certain files/folders, specifically watch certain files/folders, and perhaps most interestingly, it will set a specific environmental variable anytime nodemon runs. What this means, is that we can leveraget his environmental variable to determine whether your code is being run in a development or production environment. This variable can be accessed via `process.env.NODE_ENV`. This means that when nodemon runs, the nodemon.json configures nodemon to set `process.env.NODE_ENV = "development", whereas if the same code is run with just plain, vanilla node in production, `process.env.NODE_ENV = undefined`. Long story short, the nodemon.json is an important part of this technique being successful, but I will explain how we leverage this feature later on.

### .env recap
```
CONNECTION_STRING= // string from heroku - add ?ssl=true to the end
REACT_APP_DOMAIN= // Domain from auth0
REACT_APP_CLIENT_ID= // Client ID from auth0
CLIENT_SECRET= // Client Secret from auth0
SESSION_SECRET= // Random string of characters
SERVER_PORT=3005 // I don't suggest changing this.
```

### Setup Complete

## The Problem

Incorporating authentication into an application allows us to create a personalized experience for each of our users. As we start to incorporate authentication into an app, we find out that several components become dependent of aspects of a users session, meaning that as we develop and debug, we need to log in over and over again to prevent the parts of our app that use user data on a session from breaking. In doing so, we waste tons of time and the mounting levels of frustration cause our debugging skills to go down the toilet.

### Demonstrating the Problem
1. Open a terminal and run `nodemon` in the root of the project directory.
1. Open a second terminal and run `npm start` in the root of the project directory.
1. Before logging in, click the profile link in the header.
1. You should pretty quckly get a javascript alert with an error. This is because this component is sending a request for user information off of `req.session.user` which is undefined since we didn't log in.
1. Go back to the login screen and login using one of the social providers from auth0.
1. Once you login, you should be redirected to the profile view. You should now see your profile information and avatar populate the left hand card of the profile view.
1. You can now type into the input box and add to your list of favorite things.
  - If you were to log out, and log in with a different user, the list of favorites would be blank, and you can add a seperate list unique to the newly logged-in user. I'll let you decide whether it is worth logging in with a new user to prove that.
1. Now go restart your nodemon process by typing `rs` into the terminal that is running nodemon. This is to simulate your nodemon process restarting after you have modified code in your server files and nodemon restarting after you save.
1. Refresh your browser, the user data is gone since all of the session data has been cleared from the session store. How frustrating! The only way to get back to a working state is to go back to the home screen and log in again. There has to be a better way! There is. Read on for a way that you can solve this problem.

## The Solution

### Middleware
Middleware is an awesome feature in express that allows us to run one or more functions before, the final controller function that is resonsible to providing a response to the request. Middleware is commonly used to protect endpoint data based on authentication, or access levels, but it is certainly useful in several other use-cases as well.

### app.use(middlewareFunction)
We are able to designate a middleware function to run before every endpoint defined below it.