"use strict"

/*
    HTTP STATUSES (We could export it into another module)
*/
const HTTP_STATUS_OK = 200
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_UNAUTHORIZED = 401
// const HTTP_STATUS_FORBIDDEN = 403
// const HTTP_STATUS_NOT_FOUND = 404

const {
    Client
} = require('pg')

const bcrypt = require('bcrypt')

const database = new Client({
    user: 'joseph',
    host: 'localhost',
    database: 'hackers',
    password: 'password',
    post: 5432
})

database.connect().then(() => console.log('connected to database...')).catch(e => console.log(e))

/*
    https://www.npmjs.com/package/bcrypt
    Note: Since bcrypt.hash returns a promise (when the callback isn't specified), we need to resolve that 
    before we return the hashed password or we'll just get a Promise { <pending> }. 
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

/*
    Helper function to create the correct SQL command.
*/
const sqlCommandGenerator = async (req, type) => {
    // First hash the password
    const hashedPassword = await createHashedPw(req.body.attendeePassword)
    // this is the sql command (possibly use an ORM to simplify?)
  
  /* Let's replace this with Knex

    let text = "INSERT INTO attendees" +
        "(name,email,password,age,school,year_of_graduation," +
        "ucsc_student,ucsc_college_affil,major,linkedin_url," +
        "github_url,first_hackathon,first_cruzhacks,particate_question," +
        "humanity_goals_question,cruzhacks2020_question,has_a_team,team_members," +
        "team_member_emails,dietary_restrictions,housing_accomadation," +
        "bussing_accomadation,place_to_park) VALUES($1, $2, $3, $4, $5" +
        ", $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21," +
        " $22, $23) RETURNING *"
    */

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
        if (req.query.type !=  "mentor") {
            application.major = req.body.major
            application.gradYear = req.body.gradYear
            application.firstHackathon = req.body.firstHackathon
        }
    }

    const appFields = await Object.values(application)
    return {
      //  text,
        appFields
    }
}

// We could use an HTML5 form validation before we submit (all inputs must be filled with some value)
// Make sure the method is a POST request (HTTP message body rather than URL (safer))

module.exports.handler = async function (context, req) {
    if (req.method === "POST") {
        // Make sure we get a valid registration type
        if (req.query.type) {
            const {
                //text,
                vals
            } = await sqlCommandGenerator(req)
            try {
                await database.query(text, vals)
                context.res = {
                    body: `Successfully saved ${req.body.attendeeEmail} to database!`,
                    status: HTTP_STATUS_OK
                }
            } catch (err) {
                context.res = {
                    body: `${JSON.stringify(err.stack)}`,
                    status: HTTP_STATUS_BAD_REQUEST
                }
            }
        } else 
            if (!req.body.attendeeName) {
                // STATUS 401: Unauthorized
                context.res = {
                    body: `invalid application data!`,
                    status: HTTP_STATUS_UNAUTHORIZED
                }
            }
        }
    }
}
