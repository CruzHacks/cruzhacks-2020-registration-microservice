"use strict";

const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  user: '',
  host: '',
  database: '',
  password: '',
  post: 5432
});

client.connect().then(() => console.log('connected to database...')).catch(e => console.log(e));

/*
https://www.npmjs.com/package/bcrypt

Note: Since bcrypt.hash returns a promise (when the callback isn't specified), we need to resolve that 
before we return the hashed password or we'll just get a Promise { <pending> }. 
*/
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
  return hashedPassword;
};

module.exports.handler = async function(context, req) {
  if (req.body.username && req.body.password) {
    const hashedPw = await hashPassword(req.body.password);
    const query = {
      text: 'INSERT INTO hackers(username,password) VALUES($1, $2) RETURNING *',
      values: [req.body.username, hashedPw],
    };
    client.query(query)
      .then(res => console.log(res.rows))
      .catch(e => console.log(e));
    context.res = { body: `${req.body.username} has been added to the database!` };
  }
  else {
    context.res = {
      status: 400,
      body: "Please pass a name on the request body"
    };
  }
};
    

