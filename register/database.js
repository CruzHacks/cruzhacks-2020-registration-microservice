const db = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
});

const { createHashedPw } = require('./hashing');

const recordExist = async req => {
  // Since req.query.type is singular, we add an s to make it plural (and to conform to the table names)
  const doesExist = await db(`${req.query.type}s`)
    .where('email', req.body.email)
    .then(exist => {
      if (exist.length === 0) return false;
      return true;
    })
    .catch(err => {
      console.error(err);
      throw err;
    });
  return doesExist;
};

const insert = async req => {
  const hashedPassword = await createHashedPw(req.body.attendeePassword);

  const application = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    portalPass: hashedPassword,
  };

  // build fields based on application type
  if (
    req.query.type === 'hacker' ||
    req.query.type === 'mentor' ||
    req.query.type === 'volunteer'
  ) {
    application.age = req.body.age;
    application.gender = req.body.gender;
    application.ethnicity = req.body.ethnicity;
    application.firstCruzHacks = req.body.firstCruzHacks;
    application.whyParticipate = req.body.whyParticipate;
    application.whatSee = req.body.whatSee;
    application.dietaryRestrictions = req.body.dietaryRestrictions;
    application.restPlace = req.body.restPlace;
    application.parking = req.body.parking;
    application.accomodations = req.body.accomodations;

    if (req.query.type === 'mentor') {
      application.schoolOrCompany = req.body.schoolOrCompany;
    }
    if (req.query.type === 'hacker') {
      application.ucscStudent = req.body.ucscStudent;
      application.ucscCollege = req.body.ucscCollege;
      application.school = req.body.school;
      application.techGoals = req.body.techGoals;
      application.haveTeam = req.body.haveTeam;
      application.teamNames = req.body.teamNames;
      application.teamEmails = req.body.teamEmails;
    }
    if (req.query.type === 'volunteer') {
      application.cruzID = req.body.cruzID;
    }
    if (req.query.type !== 'volunteer') {
      application.linkedin = req.body.linkedin;
      application.github = req.body.github;
      application.transport = req.body.transport;
    }
    if (req.query.type !== 'mentor') {
      application.major = req.body.major;
      application.gradYear = req.body.gradYear;
      application.firstHackathon = req.body.firstHackathon;
    }
  }
  await db(`${req.query.type}s`)
    .insert(application)
    .then(() => {
      console.log(
        `${req.body.email} has been added to table ${req.query.type}s`
      );
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

module.exports = {
  recordExist,
  insert,
};
