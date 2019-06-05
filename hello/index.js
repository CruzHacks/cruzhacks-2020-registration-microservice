"use strict";

module.exports.handler = async function(context, req) {
  // Log the incoming request to stdout
  console.log(req);

  // Example of determing type of HTTP request
  if (req.method === "GET") console.log("Received GET Request");
  else if (req.method === "POST") console.log("Received POST Request");

  if (req.query.name || (req.body && req.body.name)) {
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: "Hello " + (req.query.name || req.body.name)
    };
  } else {
    context.res = {
      status: 400,
      body: "Please pass a name on the query string or in the request body"
    };
  }
};
    