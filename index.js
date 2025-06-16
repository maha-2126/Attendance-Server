const { fork } = require('child_process');

// Start server.js
fork('server.js');

// Start agent.js
fork('agent.js');
