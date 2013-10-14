/*
 * Simple connect server for phantom.js
 * Adapted from Twitter Bootstrap
 */

var connect = require('connect'),
    http = require('http'),
    fs = require('fs'),
    app = connect(),
    pid_path = __dirname + '/pid.txt';

// clean up after failed test runs
if (fs.existsSync(pid_path)) {
  try {
    var pid = fs.readFileSync(pid_path, { encoding: 'utf-8' });
    process.kill(pid, 'SIGHUP');
  } catch (e) {}
  fs.unlinkSync(pid_path);
}

app.use(connect.static(__dirname + '/../../'));

http.createServer(app).listen(3000);

fs.writeFileSync(pid_path, process.pid, 'utf-8');
