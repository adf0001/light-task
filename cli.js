
var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var http = require('http');

var config = require('./config');

var argv = process.argv;

function getAddrString() { return config.http_host + ":" + config.http_port; }

function outpuError(err) {
	if (err?.message?.indexOf("ECONNREFUSED") >= 0) console.log("no start at " + getAddrString());
	else console.log(err?.message || err);
}

function jsonRequest(options, data, cb) {
	var req = http.request({ host: config.http_host, port: config.http_port, ...options }, function (res) {
		let ret = "";
		res.on("data", (buffer) => { ret += buffer.toString(); });
		res.on("end", () => {
			try { ret = JSON.parse(ret) } catch (ex) { }
			cb?.(null, ret);
		});
		res.on("error", (err) => { cb?.(err); });
	});

	req.on('error', (err) => { cb?.(err); });

	if (data) {
		req.setHeader("CONTENT-TYPE", "application/json");
		req.write(JSON.stringify(data));
	}
	req.end();
}

if (argv.indexOf("start") >= 0) {
	//check status firstly
	jsonRequest({ method: 'GET', path: '/tasks/status' }, null, (err, ret) => {
		if (ret) console.log("from " + getAddrString() + ", " + ret);
		else if (err?.message?.indexOf("ECONNREFUSED") >= 0) {
			var args = [
				path.join(__dirname, "/node_modules/supervisor/lib/cli-wrapper.js"),
				"-w", __dirname,
				"-i",
				__dirname + "/node_modules," +
				__dirname + "/db," +
				__dirname + "/log",
				"-RV",
				"--",
				__dirname + "/index.js",
				"--by-supervisor",
			];

			var child = child_process.spawn("node", args,
				{ detached: true, windowsHide: true, shell: false, stdio: 'ignore' }
			);
			child.unref();		//refer nodejs spawn/options.detached
		}
		else outpuError(err);
	});
}
else if (argv.indexOf("stop") >= 0) {
	jsonRequest({ method: 'GET', path: '/tasks/exit' }, null, (err, ret) => {
		if (err) outpuError(err);
		else console.log(ret);
	});
}
else if (argv.indexOf("status") >= 0) {
	jsonRequest({ method: 'GET', path: '/tasks/status' }, null, (err, ret) => {
		if (err) outpuError(err);
		else console.log(ret + ", at " + getAddrString());
	});
}
