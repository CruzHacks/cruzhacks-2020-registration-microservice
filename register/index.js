"use strict";

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
} = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
    user: 'joseph',
    host: 'localhost',
    database: 'hackers',
    password: 'password',
    post: 5432
});

client.connect().then(() => console.log('connected to database...')).catch(e => console.log(e));

/*
    https://www.npmjs.com/package/bcrypt
    Note: Since bcrypt.hash returns a promise (when the callback isn't specified), we need to resolve that 
    before we return the hashed password or we'll just get a Promise { <pending> }. 
*/
const createHashedPw = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) reject(err);
            else resolve(hash);
        });
    });
    return hashedPassword;
};

/*
    Helper function to create the correct SQL command.
*/
const sqlCommandGenerator = async (req, type) => {
    // First hash the password
    const hashedPassword = await createHashedPw(req.body.attendeePassword);
    // this is the sql command (possibly use an ORM to simplify?)
    let text = "INSERT INTO attendees" +
        "(name,email,password,age,school,year_of_graduation," +
        "ucsc_student,ucsc_college_affil,major,linkedin_url," +
        "github_url,first_hackathon,first_cruzhacks,particate_question," +
        "humanity_goals_question,cruzhacks2020_question,has_a_team,team_members," +
        "team_member_emails,dietary_restrictions,housing_accomadation," +
        "bussing_accomadation,place_to_park) VALUES($1, $2, $3, $4, $5" +
        ", $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21," +
        " $22, $23) RETURNING *";

    let valuesObj = {
        name: req.body.attendeeName,
        email: req.body.attendeeEmail,
        password: hashedPassword,
        age: req.body.attendeeAge,
        school: req.body.attendeeSchool,
        year_of_graduation: req.body.attendeeYOG,
        ucsc_student: req.body.attendeeUCSCStudent,
        ucsc_college: req.body.attendeeCollegeAffil,
        major: req.body.attendeeMajor,
        linkedin_url: req.body.attendeeLinkedIn,
        github_url: req.body.attendeeGithub,
        first_hackathon: req.body.attendeeFirstHackathon,
        first_cruzhacks: req.body.attendeeFirstCruzhacks,
        particate_question: req.body.attendeePartipateQuestion,
        humanity_goals_question: req.body.attendeeHumanityGoalQuestion,
        cruzhacks2020_question: req.body.attendeeCruzhacksQuestion,
        has_a_team: req.body.attendeeHasATeam,
        team_members: null,
        team_member_emails: null,
        dietary_restrictions: null,
        housing_accomadation: req.body.attendeeHousingAccom,
        bussing_accomadation: req.body.attendeeBussingAccom,
        place_to_park: req.body.attendeePlaceToPark
    };
    if (req.body.attendeeUCSCStudent) {
        valuesObj.ucsc_college = req.body.attendeeCollegeAffil;
    }
    if (req.body.attendeeMajor) {
        valuesObj.major = req.body.attendeeMajor;
    }
    if (req.body.attendeeLinkedIn) {
        valuesObj.linkedin_url = req.body.attendeeLinkedIn;
    }
    if (req.body.attendeeGithub) {
        valuesObj.github_url = req.body.attendeeGithub;
    }
    if (req.body.attendeeHasATeam && req.body.attendeeTeamMembers && req.body.attendeeTeamMemberEmails) {
        valuesObj.team_members = req.body.attendeeTeamMembers;
        valuesObj.team_member_emails = req.body.attendeeTeamMemberEmails;
    }
    if (req.body.attendeeDietaryRestrict) {
        valuesObj.dietary_restrictions = req.body.attendeeDietaryRestrict;
    }

    const vals = await Object.values(valuesObj);
    return {
        text,
        vals
    };
}


// We could use an HTML5 form validation before we submit (all inputs must be filled with some value)
// Make sure the method is a POST request (HTTP message body rather than URL (safer))

module.exports.handler = async function (context, req) {
    if (req.method === "POST") {
        // Make sure we get a attendeeName, email, password, and there is a registration type
        if (req.body.attendeeName && req.body.attendeeEmail && req.body.attendeePassword && req.query.type) {
            // Now we check which query type was sent
            switch (req.query.type) {
                case "hacker": {
                    const {
                        text,
                        vals
                    } = await sqlCommandGenerator(req, "hacker");
                    try {
                        const results = await client.query(text,vals)
                        console.log("Saving hacker to database: ", results)
                        context.res = {
                            body: `Successfully saved ${req.body.attendeeEmail} (a hacker) to database!`,
                            status: HTTP_STATUS_OK
                        }
                    } catch (err) {
                        context.res = {
                            body: `${JSON.stringify(err.stack)}`,
                            status: HTTP_STATUS_BAD_REQUEST
                        }
                    }
                }
                case "mentor": {
                    const {
                        text,
                        vals
                    } = await sqlCommandGenerator(req, "mentor")
                    try {
                        const results = await client.query(text,vals)
                        console.log("Saving mentor to database: ", results)
                        context.res = {
                            body: `Successfully saved ${req.body.attendeeEmail} (a mentor) to database!`,
                            status: HTTP_STATUS_OK
                        }
                    } catch (err) {
                        context.res = {
                            body: `${JSON.stringify(err.stack)}`,
                            status: HTTP_STATUS_BAD_REQUEST
                        }
                    }
                }
                case "volunteer": {
                    const {
                        text,
                        vals
                    } = await sqlCommandGenerator(req, "volunteer")
                    try {
                        const results = await client.query(text,vals)
                        console.log("Saving volunteer to database: ", results)
                        context.res = {
                            body: `Successfully saved ${req.body.attendeeEmail} (a volunteer) to database!`,
                            status: HTTP_STATUS_OK
                        }
                    } catch (err) {
                        context.res = {
                            body: `${JSON.stringify(err.stack)}`,
                            status: HTTP_STATUS_BAD_REQUEST
                        }
                    }
                }
            }
        }
    }
};
        /*
        if (req.body.attendeeName && req.body.attendeeEmail && req.body.attendeePassword) {
            const {
                text,
                vals
            } = await sqlCommandGenerator(req);
            try {
                const results = await client.query(text, vals)
                context.res = {
                    body: `Successfully saved ${req.body.attendeeEmail} to database!`,
                    status: HTTP_STATUS_OK
                };
            } catch (err) {
                context.res = {
                    body: `${JSON.stringify(err.stack)}`
                }
            }
        } else {
            if (!req.body.attedeeName) {
                // STATUS 401: Unauthorized
                context.res = {
                    body: `Please enter a name!`,
                    status: HTTP_STATUS_UNAUTHORIZED
                }
            } else if (!req.body.attendeeEmail) {
                context.res = {
                    body: `Please enter an email!`,
                    status: HTTP_STATUS_UNAUTHORIZED
                }
            } else {
                context.res = {
                    body: `Please enter a password!`,
                    status: HTTP_STATUS_UNAUTHORIZED
                }
            }
        }
        */