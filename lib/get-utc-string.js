
/*
get a string like "UTC+0800"

getUtcString( [dtRef] )
	dtRef
		if null, get utc string of local.
*/
module.exports = function getUtcString(dtRef) {
	var tz = (dtRef || new Date()).getTimezoneOffset();
	var tzn = Math.abs(tz);
	return "UTC" + ((tz > 0) ? "-" : "+") +
		("0" + Math.floor(tzn / 60)).slice(-2) +
		("0" + (tzn % 60)).slice(-2);
}
