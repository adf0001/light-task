
var get_utc_string = require("./get-utc-string");

module.exports = function (str) {
	str = str.trim();

	//ensure month first
	var mr = str.match(/^(\d{1,2})(\s*[^\d\:\+]?\s*)(\d{1,2})([^\d\+\:\-]|$)/);
	if (mr) {
		var n1 = parseInt(mr[1]);
		var n2 = parseInt(mr[3]);
		if (n1 > 12 && n1 < 32 && n2 > 0 && n2 < 13) {
			//exchange the first 2 numbers
			str = mr[3] + mr[2] + mr[1] + mr[4] + str.slice(mr[0].length);
			//console.log("exchage as " + str);
		}
	}

	var dtNow = new Date();

	if (
		!str.match(/^\d{4,}/) && 		//check if it's a basical year-first datetime
		!str.replace(/(\:\d+)\.\d+/, "$1")		//remove the milliseconds
			.replace(/(\:\d+\s*|UTC|GMT)[\+\-]\d+/i, "")		//remove the utc+0000
			.match(/\d{4,}/)	//check if contain year elsewhere
	) {
		//not year-first and not contain year elsewhere, prefix current year
		str = dtNow.getFullYear() + " " + str;
	}

	//check if utc flag existing
	if (!str.match(/\b(UTC|GMT|Z$|\:[\d\.]\s*[\+\-])\b/i)) {
		//append local utc string
		str += " " + get_utc_string(dtNow);
	}

	var tm = Date.parse(str);
	if (tm) return new Date(tm);

	//console.log("parse fail " + str);
	return null;
}
