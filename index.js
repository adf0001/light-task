
"use strict";

console.log("============= system start =============");
console.log((new Date()).toLocaleString());

var http = require("http");
//var https = require("https");

var fs = require('fs');
var path = require('path');

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');

var config = require('./config.js');
var db = require('./lib/sqlite-db.js');
var morgan_res_body = require('./lib/morgan-res-body.js');

var morgan_ym_d_log_stream = require("./lib/morgan-ym-d-log-stream.js")

var app = express();

app.use(compression());

app.use('/static', express.static('static'));	//do not log static

morgan.token("req-body", (req, res) => {
	if (req.body && res.statusCode < 400) {
		//console.log(res.body);
		return "\nReq-body: " + JSON.stringify(req.body);
	}
});
morgan_res_body.addToken();

var logger = morgan(
	':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ' +
	':req-body :res-body',
	{
		stream: morgan_ym_d_log_stream(path.join(__dirname, "log")),
	}
);

app.use(logger);
app.use(morgan_res_body.createMiddleware());


var tasks_service = require('./lib/tasks-service');
tasks_service(app, db);


//http
var httpServer;

if (config.http_port >= 0) {
	httpServer = http.createServer(app);

	httpServer.listen(config.http_port || 80, config.http_host || "127.0.0.1", () => {
		var addr = httpServer.address();
		console.log("server run in HTTP mode at " + addr.address + ":" + addr.port);
	});
}

