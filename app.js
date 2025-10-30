// app.js
const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.end(`Hello from Docker image! commit: ${process.env.GIT_COMMIT || 'local'}`);
});
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
