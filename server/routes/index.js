// react routes that require index.html
exports.react = new Set(['/user', '/projects']);

// request handlers for server routes
exports.api = {
  GET: {
    users: function getUsers() {
      return new Promise((resolve) => {
        resolve([
          { userId: 1, username: 'francis' },
          { userId: 2, username: 'p-w-party-m' },
          { userId: 3, username: 'brianheartsocketio' },
          { userId: 4, username: 'shaikat' },
        ]);
      });
    },
    projects: function getProjects() {
      return new Promise((resolve) => {
        resolve([
          { projectId: 1,
            project: 'Hello GitBud',
            languages: ['JavaScript', 'HTML', 'CSS'],
            experience: 'beginner',
            userIds: [0, 1, 2],
          },
          { projectId: 2,
            project: 'N-Queens',
            languages: ['JavaScript', 'HTML', 'BackBone'],
            experience: 'Boss mode',
            userIds: [0, 3],
          },
        ]);
      });
    },
    'recommended-pairs': function getProjects() {
      return new Promise((resolve) => {
        resolve([
          { userId: 2, username: 'p-w-party-m', rating: 89 },
          { userId: 3, username: 'brianheartsocketio', rating: 100 },
          { userId: 4, username: 'shaikat', rating: -13 },
        ]);
      });
    },
  },
};
