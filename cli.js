
var path = require('path');
var child_process = require('child_process');

var dayjs = require('dayjs');

var simple_req = require('simple-req/req-by-node');

var config = require('./config');

//var console_table_no_index= require("./lib/console-table-no-index");
var half_width_length = require("./lib/half-width-length");
var parse_datetime_by_year_first = require("./lib/parse-datetime-by-year-first");

//some tools

function getAddrString() { return config.http_host + ":" + config.http_port; }

function outputError(err, result) {
	if (err?.message?.indexOf("ECONNREFUSED") >= 0) console.log("no start at " + getAddrString());
	else console.log(err?.message || err, result?.json?.error || "");
}

function jsonRequest(requestOptions, data, cb) {
	simple_req({ host: config.http_host, port: config.http_port, ...requestOptions }, data, cb);
}

function dtString(dt, toUtc) {
	if (toUtc) {
		var dtNow = new Date();
		dt = new Date(dt.getTime() + dtNow.getTimezoneOffset() * 60000);
	}
	return dayjs(dt).format('YYYY-MM-DD HH:mm:ss');
}

function formatServerUtc(str) {
	if (!str || str === "null") return "";

	//parse utc
	str = dtString(Date.parse(str + " UTC+0000"));
	//trim time 00:00:00
	str = str.replace(/\s+00:00:00$/, "");

	return str;
}

function outputRows(rows) {
	//console_table_no_index(rows, ["id", "title", "expire_at", "done_at"]);

	var nameList = ["id", "title", "expire_at", "done_at"];
	var widthList = nameList.map((v) => v.length);
	var n;

	rows = rows.map((v) => {
		var row = {
			id: "" + v.id,
			title: v.title,
			"title:length": half_width_length(v.title, config.regExtraHalf),
			expire_at: formatServerUtc(v.expire_at),
			done_at: formatServerUtc(v.done_at),
		};
		//console.log(row);
		//width max
		nameList.forEach((v, i) => { if ((n = row[v + ":length"] || row[v].length) > widthList[i]) widthList[i] = n });
		return row;
	})

	var a = [];
	a[a.length] = nameList.map((v, i) => {
		return v.padEnd(widthList[i]);
	}).join("  ");
	a[a.length] = widthList.map((v) => "".padEnd(v, "-")).join("  ");

	rows.forEach((row) => {
		a[a.length] = nameList.map((v, i) => {
			return row[v] + "".padEnd(widthList[i] - (row[v + ":length"] || row[v].length));
		}).join("  ");
	})

	console.log("\n" + a.join("\n"));
}

//process

var argv = process.argv, idx;

if (argv.indexOf("start") >= 0) {
	//check status firstly
	jsonRequest({ method: 'GET', path: '/tasks/status' }, null, (err, ret) => {
		if (ret) console.log("from " + getAddrString() + ", " + ret.body);
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

			if (argv.indexOf("--foreground") >= 0) {
				//foreground
				child_process.spawn("node", args, { shell: true, stdio: 'inherit' });
			}
			else {
				//background
				var child = child_process.spawn("node", args,
					{ detached: true, windowsHide: true, shell: false, stdio: 'ignore' }
				);
				child.unref();		//refer nodejs spawn/options.detached
			}
		}
		else outputError(err);
	});
}
else if (argv.indexOf("stop") >= 0) {
	jsonRequest({ method: 'GET', path: '/tasks/exit' }, null, (err, ret) => {
		if (err) outputError(err);
		else console.log(ret.body);
	});
}
else if (argv.indexOf("status") >= 0) {
	jsonRequest({ method: 'GET', path: '/tasks/status' }, null, (err, ret) => {
		if (err) outputError(err);
		else console.log(ret.body + ", at " + getAddrString());
	});
}
else if ((idx = argv.indexOf("add")) >= 0) {
	var title = argv[idx + 1]?.trim();
	var dts = argv[idx + 2];

	var dt = parse_datetime_by_year_first(dts);
	if (!dt) {
		console.log("fail to parse year-first datetime value, " + dts);
	}
	else if (dt <= new Date()) {
		console.log("expire time should be after now, " + dtString(dt));
	}
	else {
		//console.log(title, dtString(dt));

		jsonRequest({ method: 'POST', path: '/tasks/' }, { title, expire_at: dtString(dt, true) }, (err, ret) => {
			//console.log(err, ret);
			if (err) outputError(err, ret);
			else outputRows(ret?.json?.rows);
		});
	}

}
