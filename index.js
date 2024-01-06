
var path = require('path');
var fs = require('fs');
var morgan_ym_d_log_stream = require("morgan-ym-d-log-stream")
var logStream = morgan_ym_d_log_stream(path.join(__dirname, "log"), { consoleMax: 250 });

logStream.write("\n=============\nstart at " + (new Date()).toLocaleString() + "\n");

var http = require("http");
//var https = require("https");

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');

var config = require('./config.js');
var better_sqlite3 = require('better-sqlite3');
var morgan_res_body = require('morgan-res-body');

var exit_tool = require('exit-tool');

var app = express();

app.use(compression());

app.use('/static', express.static('static'));	//do not log static

morgan.token("req-body", (req, res) => {
	if (req.body && res.statusCode < 400) {
		//console.log(res.body);
		return "\nReq-body: " + JSON.stringify(req.body);
	}
});
morgan.token("res-body", morgan_res_body.tokenFunction);


var morgan_logger = morgan(
	':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ' +
	':req-body :res-body',
	{ stream: logStream, }
);

app.use(morgan_logger);
app.use(morgan_res_body.createMiddleware());

//common service
app.get("/tasks/status", (req, res) => {
	res.status(200).end("running");
});

var bySupervisor = process.argv.indexOf("--by-supervisor") > 0;

app.get("/tasks/exit", (req, res) => {
	res.status(200).end("exiting");
	exit_tool({ delay: 200, killParent: bySupervisor })
});
app.get("/tasks/restart", (req, res) => {
	res.status(200).end(bySupervisor ? "restarting" : "unsupported");
	if (bySupervisor) exit_tool({ delay: 200 });
});

//task service
var dbFile = config.sqlite_db.startsWith(".") ? path.join(__dirname, config.sqlite_db) : config.sqlite_db;
var dbPath = path.dirname(dbFile);
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

var db = new better_sqlite3(dbFile);

var task_service = require('task-service');
var api = task_service["better-sqlite3-api"].get(db, { prepare: true });
app.use("/tasks", task_service.loadService(express.Router(), api));

//swagger
if (config.swagger) {
	var swaggerUi = require('swagger-ui-express');
	var yamljs = require('yamljs');

	var swaggerYaml = yamljs.load(__dirname + '/node_modules/task-service/doc/swagger.yaml');
	swaggerYaml.servers = [{ url: "/tasks" }];
	//console.log(swaggerYaml);

	app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerYaml));
}

//http
var httpServer;

if (config.http_port >= 0) {
	httpServer = http.createServer(app);

	httpServer.listen(config.http_port || 80, config.http_host || "127.0.0.1", () => {
		var addr = httpServer.address();
		console.log("server run in HTTP mode at " + addr.address + ":" + addr.port);
	});
}

