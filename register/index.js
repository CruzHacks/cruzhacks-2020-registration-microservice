const httpStatus = require('./issueHTTPstatus');
const { recordExist, insert } = require('./database');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// We could use an HTML5 form validation before we submit (all inputs must be filled with some value)
// Make sure the method is a POST request (HTTP message body rather than URL (safer))

module.exports.handler = async function(context, req) {
  if (req.method === 'POST') {
    // User didn't fill out the needed fields
    if (!req.body.email || !req.body.firstName || !req.body.lastName) {
      context.res = {
        body: `invalid application data!`,
        status: httpStatus.unauthorized,
      };
    }
    // We make sure a query type has been passed
    if (
      req.query.type === 'hacker' ||
      req.query.type === 'mentor' ||
      req.query.type === 'volunteer'
    ) {
      // We check to see if the user already exist in the database, if they do return a bad request
      const exist = await recordExist(req);
      if (exist) {
        context.res = {
          body: `User: ${req.body.email}, already exist in the database!`,
          status: httpStatus.badRequest,
        };
      } else {
        // now we try to insert the user into database
        try {
          await insert(req);
          context.res = {
            body: `Successfully saved ${req.body.email} to database!`,
            status: httpStatus.ok,
          };
        } catch (err) {
          context.res = {
            body: `${JSON.stringify(err.stack)}`,
            status: httpStatus.badRequest,
          };
        }
      }
    } else {
      context.res = {
        body: `Query parameter not found.`,
        status: httpStatus.badRequest,
      };
    }
  }
};
