
var stream = require('stream');

module.exports = function (tabularData, properties) {
	// @see https://stackoverflow.com/a/67859384
	const ts = new stream.Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
	const logger = new console.Console({ stdout: ts })
	logger.table(tabularData, properties)
	const table = (ts.read() || '').toString()
	let result = '';
	for (let row of table.split(/[\r\n]+/)) {
		let r = row.replace(/[^┬]*┬/, '┌');
		r = r.replace(/^├─*┼/, '├');
		r = r.replace(/│[^│]*/, '');
		r = r.replace(/^└─*┴/, '└');
		r = r.replace(/'/g, ' ');
		result += `${r}\n`;
	}
	console.log(result);
}
