# cruzhacks-2020-registration-microservice
Planning: https://docs.google.com/document/d/1HiK7Lfoic8gRNepY9DpMgcH5aKHyl3WbYVyAVG2FEjw/

## Pre-requisites
NodeJS (I'm using v10.10.0)
PostgreSQL needs to be installed(http://postgresguide.com/setup/install.html)
Download the required packages:
```npm install```

## Setting up PostgreSQL
For more help checkout: 
* [Article 1](https://blog.logrocket.com/setting-up-a-restful-api-with-node-js-and-postgresql-d96d6fc892d8)
* [Article 2](https://www.codementor.io/engineerapart/getting-started-with-postgresql-on-mac-osx-are8jcopb)

Create a password to the current user, to find the current owner do: 
``` \list ```

Then change the password (user being the owner), it should then prompt you to change it:
``` \password {user} ```

Now to create a local database by doing the following (I'm creating a database of Hackers):
``` CREATE DATABASE hackers; ```

Give all access privileges to the owner.
``` 
GRANT ALL PRIVILEGES ON DATABASE database_username TO username; 
```
Then we need to connect to the hackers database:
``` \c hackers ```

Create a table inside the hacker database.
``` 
CREATE TABLE hackers(
  user_id serial PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

To view the table inside the database:
``` SELECT * FROM hackers; ```

## Microservice setup
In the file /create/index.js, change the client parameters for postgre-node. I'm not sure how to setup enviroment variables for this microservice so I'm going to be omitting that from the file for now. Change the user, database, and password to the information you used to create the database. Host is usually set to 'localhost' and port is set to 5432. 

## Note
This seems to be breaking when using an unstable release of Node.JS. Use v10.10.0 to offset this.


