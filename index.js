
"use strict";

console.log("============= system start =============");
console.log(new Date());

var http = require("http");
//var https = require("https");

var fs = require('fs');

var express = require('express');
var compression = require('compression');

//var process = require("./process.js");
var config = require('./config.js');

var db = require('./lib/sqlite-db.js');

var app = express();

app.use(compression());
app.use('/static', express.static('static'));

var tasks = require('./lib/tasks');
tasks(app, db);

//http
var httpServer;

if (config.http_port >= 0) {
	httpServer = http.createServer(app);

	httpServer.listen(config.http_port || 80, config.http_host || "127.0.0.1", () => {
		var addr = httpServer.address();
		console.log("server run in HTTP mode at " + addr.address + ":" + addr.port);
	});
}

