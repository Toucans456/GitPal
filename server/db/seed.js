const driver = require('./index').driver;
const session = driver.session();

// Deletes all nodes and relationships in the graph
const dropGraph = function dropGraph() {
  const dropGraphQueryString = 'MATCH (n) DETACH DELETE n';
  return session.run(dropGraphQueryString)
    .then((result) => {
    console.log('Graph dropped');
    })
    .catch((error) => {
      session.close();
      throw error;
    });
}

const addUsersQueryString = `
  CREATE
    (:User {rating: 80, name: 'Robb Stark', description: "I'm here to find a mentor who can guide me to make wise decisions.", experience: 'Beginner', language: 'JavaScript', avatarUrl: 'http://i.imgur.com/brqt5mo.jpg'}),
    (:User {rating: 90, name: 'Arya Stark', description: "Looking to practice and gain experience by pair programming on projects.", experience: 'Intermediate', language: 'JavaScript', avatarUrl: 'http://i.imgur.com/yGmkAdQ.jpg'}),
    (:User {rating: 100, name: 'Jon Snow', description: "I've hit a wall learning programming and would like to climb over it this winter by working on projects.", experience: 'Intermediate', language: 'JavaScript', avatarUrl: 'http://i.imgur.com/YoHDe9x.jpg'}),
    (:User {rating: 70, name: 'Bran Stark', description: "I have seen a lot of code, and would like to help others see what I've seen by pairing!", experience: 'Advanced', language: 'C++', avatarUrl: 'http://i.imgur.com/jzc2vxp.png'})
  `;

// Add user nodes
function addUsers() {
  return session.run(addUsersQueryString)
    .then((result) => {
      console.log('Users added');
    })
    .catch((error) => {
      session.close();
      throw error;
    });
}

const addProjectsQueryString = `
  CREATE
    (:Project {project: 'Hello GitBud', language:'JavaScript', experience: 'Beginner', link: 'https://github.com/cranebaes/hello-gitbud', structure: '[{"text":"Do the thing","complete":false},{"text":"Do the other thing.","hint":"Do it well!","complete":false}]'}),
    (:Project {project: 'N-Queens', language:'JavaScript', experience: 'Advanced', link: 'https://github.com/cranebaes', structure: '[{"text":"Do the thing","complete":false},{"text":"Do the other thing.","hint":"Do it well!","complete":false}]'})
  `;

// Add project nodes
const addProjects = function addProjects() {
  return session.run(addProjectsQueryString)
    .then((result) => {
      console.log('Projects added');
    })
    .catch((error) => {
      session.close();
      throw error;
    });
}

//Create INTERESTED_IN relationships between users and projects
const addInterestedInRelationshipsQueryString = `
  MATCH (robb:User) WHERE robb.name = "Robb Stark"
  MATCH (arya:User) WHERE arya.name = "Arya Stark"
  MATCH (jon:User) WHERE jon.name = "Jon Snow"
  MATCH (bran:User) WHERE bran.name = "Bran Stark"
  MATCH (helloGitBud:Project) WHERE helloGitBud.project = "Hello GitBud"
  MATCH (nQueens:Project) WHERE nQueens.project = "N-Queens"
  CREATE
    (robb)-[:INTERESTED_IN]->(helloGitBud),
    (arya)-[:INTERESTED_IN]->(helloGitBud),
    (jon)-[:INTERESTED_IN]->(nQueens),
    (bran)-[:INTERESTED_IN]->(nQueens)
  `;

const addInterestedInRelationships = function addInterestedInRelationships() {
  return session.run(addInterestedInRelationshipsQueryString)
    .then((result) => {
      console.log('INTERESTED_IN relationships added');
    })
    .catch((error) => {
      session.close();
      throw error;
    });
}

// Add pair
const addPairQueryString = `
  MATCH (robb:User) WHERE robb.name = "Robb Stark"
  MATCH (bran:User) WHERE bran.name = "Bran Stark"
  MATCH (nQueens:Project) WHERE nQueens.project = "N-Queens"
  CREATE
    (group:Group),
    (robb)-[:PAIRED_WITH]->(group),
    (bran)-[:PAIRED_WITH]->(group),
    (group)-[:WORKING_ON]->(nQueens)
  `;

const addPair = function addPair() {
  return session.run(addPairQueryString)
    .then((result) => {
      console.log('PAIRED_WITH relationships added');
    })
    .catch((error) => {
      session.close();
      throw error;
    });
}

// Call functions that seed the db
dropGraph()
  .then(addUsers)
  .then(addProjects)
  .then(addInterestedInRelationships)
  .then(addPair)
  .then(() => {
    session.close();
    driver.close();
  });
