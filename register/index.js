"use strict"
require('dotenv').config()
/*
    HTTP STATUSES (We could export it into another module)
*/
const HTTP_STATUS_OK = 200
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_UNAUTHORIZED = 401
// const HTTP_STATUS_FORBIDDEN = 403
// const HTTP_STATUS_NOT_FOUND = 404

const bcrypt = require('bcrypt')

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PW,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    }
});

/*
    https://www.npmjs.com/package/bcrypt
    Note: Since bcrypt.hash returns a promise (when the callback isn't specified), we need to resolve that 
    before we return the hashed password or we'll just get a Promise { <pending> }. 
    Also: if salt rounds are > 20~ it takes 30seconds - 5 minutes to hash
*/
const createHashedPw = async (password) => {
    const saltRounds = 10
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err)
            else resolve(hash)
        })
    })
    return hashedPassword
}

const recordExist = async (req) => {
    // Since req.query.type is singular, we add an s to make it plural (and to conform to the table names)
    await knex(`${req.query.type}s`).where('email', req.body.email).then((exist) => {
        if (exist.length === 0) return false
        else return true
    }).catch((err => {
        console.log(err);
        throw err
    }));
}

const insert = async (req) => {

    const hashedPassword = await createHashedPw(req.body.attendeePassword)

    let application = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        portalPass: hashedPassword,
    }

    // build fields based on application type
    if (req.query.type == "hacker" || req.query.type == "mentor" || req.query.type == "volunteer") {
        application.age = req.body.age
        application.gender = req.body.gender
        application.ethnicity = req.body.ethnicity
        application.firstCruzHacks = req.body.firstCruzHacks
        application.whyParticipate = req.body.whyParticipate
        application.whatSee = req.body.whatSee
        application.dietaryRestrictions = req.body.dietaryRestrictions
        application.restPlace = req.body.restPlace
        application.parking = req.body.parking
        application.accomodations = req.body.accomodations

        if (req.query.type == "mentor") {
            application.schoolOrCompany = req.body.schoolOrCompany
        }
        if (req.query.type == "hacker") {
            application.ucscStudent = req.body.ucscStudent
            application.ucscCollege = req.body.ucscCollege
            application.school = req.body.school
            application.techGoals = req.body.techGoals
            application.haveTeam = req.body.haveTeam
            application.teamNames = req.body.teamNames
            application.teamEmails = req.body.teamEmails
        }
        if (req.query.type == "volunteer") {
            application.cruzID = req.body.cruzID
        }
        if (req.query.type != "volunteer") {
            application.linkedin = req.body.linkedin
            application.github = req.body.github
            application.transport = req.body.transport
        }
        if (req.query.type != "mentor") {
            application.major = req.body.major
            application.gradYear = req.body.gradYear
            application.firstHackathon = req.body.firstHackathon
        }
    }
    await knex(`${req.query.type}s`).insert(application).then(() => {
        console.log(`${req.body.email} has been added to table ${req.query.type}s`)
    }).catch((err) => {
        console.log(err);
        throw err
    })
}

// We could use an HTML5 form validation before we submit (all inputs must be filled with some value)
// Make sure the method is a POST request (HTTP message body rather than URL (safer))

module.exports.handler = async function (context, req) {
    if (req.method === "POST") {
        // User didn't fill out the needed fields
        if (!req.body.email || !req.body.firstName || !req.body.lastName) {
            context.res = {
                body: `invalid application data!`,
                status: HTTP_STATUS_UNAUTHORIZED
            }
        }
        // We make sure a query type has been passed
        if (req.query.type) {
            // We check to see if the user already exist in the database, if they do return a bad request
            const exist = recordExist(req);
            if (exist) {
                context.res = {
                    body: `User: ${req.body.email}, already exist in the database!`,
                    status: HTTP_STATUS_BAD_REQUEST
                }
            } else {
                // now we try to insert the user into database
                try {
                    insert(req)
                    context.res = {
                        body: `Successfully saved ${req.body.email} to database!`,
                        status: HTTP_STATUS_OK
                    }
                } catch (err) {
                    context.res = {
                        body: `${JSON.stringify(err.stack)}`,
                        status: HTTP_STATUS_BAD_REQUEST
                    }
                }
            }
        } else {
            context.res = {
                body: `Query parameter not found.`,
                status: HTTP_STATUS_BAD_REQUEST
            }
        }
    }
}