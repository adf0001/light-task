
var fs = require('fs');
var path = require('path');

module.exports = function (logDir) {
	var logDate = -1;
	var logStream = null;

	return {
		write: (str) => {
			process.stdout.write(str);

			var dtNow = new Date();
			if (dtNow.getDate() !== logDate) {
				if (logStream) {
					logStream.close();
					logStream = null;
				}

				var y = "" + dtNow.getFullYear();
				var m = ("0" + (dtNow.getMonth() + 1)).slice(-2);
				var d = ("0" + dtNow.getDate()).slice(-2);

				var dir = path.join(logDir, y, m);
				if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

				logStream = fs.createWriteStream(
					path.join(dir, y + "-" + m + "-" + d + ".log"),
					{ flags: 'a' });

				logDate = dtNow.getDate();
			}
			logStream.write(str);
		}
	}
}
