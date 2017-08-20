/*
  This module contains request handlers for most of the routes
  as well as a set for quick responses where index.html is required.

  THINGS TO FIX:
  There's a lot of repeated code in the db queries, which you may find it helpful to modularise.

  Also, the authentication endpoints are split across here and server.js, mostly for our convenience.
  Consider refactoring.
*/

// Required to create a db session and run a query.
// For info on how to do this better, check the hints in the db module.
const db = require('../db');
const dbDriver = db.driver;

// React routes that require index.html.
exports.react = new Set(['user', 'projects']);

/*
  Request handlers for API routes.
  These are stored on an object for easy lookup in the request-handler module and are indexed
  first by method then by route.
*/
exports.api = {
  GET: {
    /*
      GET METHODS
    */
    // Returns an object with numerical properties representing
    // project IDs each with a value of an array of checkpoints of the form
    // { text: prompt(string), hint: hint on how to tackle prompt(string), complete: completion status of prompt(bool) }
    progress: function getProgress(req) {
      return new Promise((resolve, reject) => {
        console.log('GET progress');
        const dbSession = dbDriver.session();
        dbSession.run(`
          MATCH (:User {ghId: ${req.user.ghInfo.id}})-->(group:Group)-->(project:Project)
          RETURN group, project
        `)
          .then((res) => {
            const projectProgress = {};
            res.records.forEach((record) => {
              const group = record.get('group').properties;
              projectProgress[record.get('project').identity] = group.progress ? JSON.parse(group.progress) : [];
            });
            resolve(projectProgress);
          })
          .catch(reject);
      });
    },

    messages: function getMessages(req) {
      return new Promise((resolve, reject) => {
        console.log('GET messages');
        const dbSession = dbDriver.session();
        dbSession.run(`
          MATCH (:User {ghId: ${req.user.ghInfo.id}})-[to_user]-(message:Message)--(other:User)
          RETURN message, to_user, other ORDER BY message.created_at DESC
        `)
          .then((res) => {
            const messages = {};
            res.records.forEach((record) => {
              const text = record.get('message').properties.text;
              const userId = record.get('other').identity.toNumber();
              const sender = record.get('to_user').type === 'SENT';
              console.log({ text, userId, sender });
              messages[userId] = messages[userId]
                ? messages[userId].concat({ sender, text })
                : [{ sender, text }];
            });
            resolve(messages);
          })
          .catch((err) => {
            reject(err);
            dbSession.close();
          });
      });
    },

    users: function getUsers(req) {
      return new Promise((resolve, reject) => {
        const dbSession = dbDriver.session();
        console.log('GET users');
        const ghId = req.user.ghInfo.id;
        const projectId = Number(req.headers.id);
        dbSession.run(`
          MATCH (pair:User)-->(group:Group)<--(user:User {ghId: ${ghId}}),
            (group)-->(pairedProject:Project),
            (pair)-[:INTERESTED_IN]->(project:Project)
          WHERE ID(project) = ${projectId}
          RETURN pair, COLLECT(ID(pairedProject)) as projects
          UNION
          MATCH (pair:User)-[:INTERESTED_IN]->(project:Project)
          WHERE ID(project) = ${projectId} AND NOT (pair)-->(:Group)<--(:User {ghId: ${ghId}})
          RETURN pair, false as projects
        `)
          .then((res) => {
            resolve(
              res.records.map(user => new db.models.User(user.get('pair'), user.get('projects')))
            )
          })
          .catch(reject)
          .then(() => dbSession.close());
      });
    },

    projects: function getProjects(req) {
      return new Promise((resolve, reject) => {
        const dbSession = dbDriver.session();
        console.log('GET projects');
        const ghId = req.user.ghInfo.id;
        dbSession.run(`
            MATCH (user:User {ghId: ${ghId}})-->(group:Group)-->(project:Project)
            WITH user, group, project
            MATCH (pair:User)-->(group)-->(project)
            WHERE NOT pair = user
            RETURN COLLECT(ID(pair)) as pairs, true as interested, project
            UNION
            MATCH (user:User {ghId: ${ghId}})-[:INTERESTED_IN]->(project:Project)
            WHERE NOT (user)-->(:Group)-->(project)
            RETURN false as pairs, true as interested, project
            UNION
            MATCH (user:User {ghId: ${ghId}}), (project:Project)
            WHERE NOT (user)-->(:Group)-->(project) AND NOT (user)-[:INTERESTED_IN]->(project)
            RETURN false as pairs, false as interested, project
         `)
          .then((res) => {
            resolve(res.records.map(project => 
              new db.models.Project(project.get('project'), project.get('pairs'), project.get('interested'))
            ));
          })
          .catch(reject)
          .then(() => dbSession.close());
      });
    },
  },
  /*
    POST METHODS
  */
  POST: {
    projects: function projects(req) {
      console.log(req.body)
      return new Promise((resolve, reject) => {
        const dbSession = dbDriver.session();
        console.log('POST projects');
        dbSession.run(
          `
          MATCH (user:User) WHERE user.ghId=${Number(req.user.ghInfo.id)}
          MATCH (project:Project) WHERE ID(project) = ${Number(req.body.projectId)}
          MERGE (user)-[:INTERESTED_IN]->(project)
          return user, project
          `
        )
          .then((res) => {
            resolve(res);
          })
          .catch(reject)
          .then(() => dbSession.close());
      });
    },

    pair: function addPair(req) {
      return new Promise((resolve, reject) => {
        const dbSession = dbDriver.session();
        console.log('POST pair');
        dbSession.run(`
          MATCH (project:Project) WHERE ID(project) = ${Number(req.body.project)}
          MATCH (user:User) WHERE user.ghId = ${Number(req.user.ghInfo.id)}
          MATCH (pair:User) WHERE ID(pair) = ${Number(req.body.partnered)}
          MERGE (user)-[:PAIRED_WITH]->(group:Group)<-[:PAIRED_WITH]-(pair)
          MERGE (group)-[:WORKING_ON]->(project)
          SET group.progress = project.structure
          return user, pair, group, project
        `)
          .then((res) => {
            console.log(res);
            resolve(res);
          })
          .catch(reject)
          .then(() => dbSession.close());
      });
    },

    messages: function sendMessage(req) {
      return new Promise((resolve, reject) => {
        const dbSession = dbDriver.session();
        const message = req.body;
        console.log('POST messages', message);
        dbSession.run(`
          MATCH (user:User {ghId: ${ req.user.ghInfo.id }}), (recipient:User)
          WHERE ID(recipient) = ${ req.body.recipient }
          CREATE (user)-[:SENT]->(:Message {text: '${ req.body.text.replace('\'', '\\\'') }', created_at: TIMESTAMP()})-[:RECEIVED]->(recipient)
        `)
          .then(() => {
            resolve();
            dbSession.close();
          })
          .catch((err) => {
            reject(err);
            dbSession.close();
          })
      });
    },

    progress: function updateProgress(req) {
      return new Promise((resolve, reject) => {
        console.log(req.body);
        const dbSession = dbDriver.session();
        dbSession.run(`
          MATCH (:User {ghId: ${req.user.ghInfo.id}})-->(group:Group)-->(project:Project)
          WHERE ID(project) = ${req.body.projectId}
          SET group.progress = '${JSON.stringify(req.body.progress).replace('\'', '\\\'')}'
        `)
          .then(() => resolve())
          .catch(reject);
      })
    }
  },

};

// Request handlers for some authentication routes.
// Perhaps these should all be in server.js or perhaps all here.
// Currently (for convenience), they're split across the two, which is slightly confusing.
exports.auth = {
  GET: {
    signout: function signout(req, res) {
      // destroy session and redirect to home
      req.logout();
      res.redirect('/');
    },
    authenticated: function checkAuthenticated(req, res) {
      // If user signed in, send account details
      if (req.isAuthenticated()) {
        const dbSession = dbDriver.session();
        dbSession.run(`
          MATCH (user:User {ghId: ${ req.user.ghInfo.id }}) RETURN user
        `)
          .then((result) => {
            res.json(new db.models.User(result.records[0].get('user')));
            dbSession.close();
          })
          .catch(() => {
            res.send(false);
            dbSession.close();
          });
      } else {
        // Confirm not signed in
        res.send(false);
      }
    },
    // Currently server.js handling--possibly review
    // github: function callback(req, res, urlParts) {
    //   // upon successful authentication, redirect to projects
    //   if (urlParts[3] === 'callback') {
    //     res.redirect('/projects');
    //   } else {
    //     res.statusCode = 400;
    //     res.send('Invalid request');
    //   }
    // }
  }
}
