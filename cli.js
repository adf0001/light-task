
var path = require('path');
var child_process = require('child_process');

var dayjs = require('dayjs');

var simple_req = require('simple-req/req-by-node');
var halfwidth_kit = require("halfwidth-kit");

var config = require('./config');

//var console_table_no_index= require("./lib/console-table-no-index");

var parse_datetime_by_year_first = require("parse-datetime-by-year-first");

var _package_json = require("./package.json");

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
		var title = v.title;
		var titleLen = halfwidth_kit.length(title, config.regHalfwidth);
		if (rows.length > 1 && titleLen > 50) {
			title = halfwidth_kit.slice(title, 0, 47, config.regHalfwidth) + "...";
			titleLen = halfwidth_kit.length(title, config.regHalfwidth);
		}

		var row = {
			id: "" + v.id,
			title: title,
			"title:length": titleLen,
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

function listExpiring(dts) {
	if (dts.match(/^today$/i)) dts = dayjs(new Date()).format('YYYY-MM-DD');

	var dt = parse_datetime_by_year_first(dts);
	if (!dt) {
		console.log("fail to parse year-first datetime value, " + dts);
		return;
	}

	if (dtString(dt).match(/00\:00\:00$/) && dts.indexOf(":") < 0) {
		//if only date and no time, set to the end of the day.
		dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59, 999);
	}

	jsonRequest(
		{
			method: 'GET',
			path: '/tasks/expire/' + encodeURIComponent(dtString(dt, true))
		},
		null,
		(err, ret) => {
			//console.log(err, ret);
			if (err) outputError(err, ret);
			else outputRows(ret?.json?.rows);
		}
	);

}

var helpList = [
	"light-task cli, v" + _package_json.version,
	"",
	"Usage: light-task command [--options]",
	"",
	"command:",
	"	start				start the service, in background.",
	"		--foreground	start in foreground",
	"	stop				stop the service",
	"	status				check the service status",
	"",
	"	add 'title' 'expire'",
	"              			add a task.",
	"						'title': a title string",
	"						'expire': a year-first datetime string, e.g. '2022-12-5' or '2012/12/25'",
	"",
	"	list				list tasks. Without options, it's same as '--expire today'.",
	"		<id>			list detail by task id",
	"		--all			list all",
	"		--expire today",
	"						list tasks that expire today",
	"		--expire 'datetime'",
	"						list by an appointed expire datetime",
	"	done <id>			set done flag by task id",
	"	remove <id>			remove by task id",
].map((v) => {
	//replace tab to spaces
	return v.split("\t").reduce((r, rv) => r + "".repeat(4 - (r.length % 4)) + rv)
});

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
else if ((idx = argv.indexOf("list")) >= 0) {
	var argList = argv[idx + 1];
	var mr;

	if (mr = argList?.match(/--(expire|expiring)(-.*)?/)) {
		if (mr[2]) listExpiring(mr[2].slice(1));
		else {
			var argList2 = argv[idx + 2];
			if (argList2 && argList2.charAt(0) !== "-") listExpiring(argList2);
		}
	}
	else if (argList === "--all") {
		jsonRequest({ method: 'GET', path: '/tasks/' }, null, (err, ret) => {
			//console.log(err, ret);
			if (err) outputError(err, ret);
			else outputRows(ret?.json?.rows);
		});
	}
	else if (argList?.match(/^\d+$/)) {
		jsonRequest({ method: 'GET', path: '/tasks/' + argList }, null, (err, ret) => {
			//console.log(err, ret);
			if (err) outputError(err, ret);
			else outputRows(ret?.json?.rows);
		});
	}
	else if (!argList) {
		listExpiring("today");
	}
	else console.log("list argument error");
}
else if ((idx = argv.indexOf("done")) >= 0) {
	var argDone = argv[idx + 1];

	if (argDone?.match(/^\d+$/)) {
		jsonRequest({ method: 'PUT', path: '/tasks/' + argDone + "/done" }, null, (err, ret) => {
			//console.log(err, ret);
			if (err) outputError(err, ret);
			else outputRows(ret?.json?.rows);
		});
	}
	else console.log("done argument error");
}
else if ((idx = argv.indexOf("remove")) >= 0) {
	var argRemove = argv[idx + 1];

	if (argRemove?.match(/^\d+$/)) {
		jsonRequest({ method: 'DELETE', path: '/tasks/' + argRemove }, null, (err, ret) => {
			//console.log(err, ret);
			if (err) outputError(err, ret);
			else outputRows(ret?.json?.rows);
		});
	}
	else console.log("remove argument error");
}
else {
	console.log(helpList.join("\n"));
}
