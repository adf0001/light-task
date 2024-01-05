
var path = require('path');
var fs = require('fs');
var dayjs = require('dayjs');

var config = require('./config');

var dbFile = path.join(__dirname, config.sqlite_db);

function dtString(dt, toUtc) {
	if (toUtc) {
		var dtNow = new Date();
		dt = new Date(dt.getTime() + dtNow.getTimezoneOffset() * 60000);
	}
	return dayjs(dt).format('YYYY-MM-DD HH:mm:ss');
}

var toFile = "light-task.sqlite." + dtString(new Date()).replace(/[-:]/g, "").replace(/\s/g, "-") + ".bak";

fs.copyFileSync(dbFile, toFile, fs.constants.COPYFILE_EXCL);
console.log("backed up to file " + toFile)
