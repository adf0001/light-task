
//refer https://thewebdev.info/2022/03/06/how-to-log-the-response-body-with-express/

var morgan = require('morgan');

/*
create a middleware function for express
	options
		skip
			a function like (req, res)=>{...},
			return true to indicate to skip the request.

		bufferName
			a property name for saving body buffer in res, default "bodyBuffer".

*/
function createMiddleware(options) {
	var skip = options?.skip;
	var bufferName = options?.bufferName || "bodyBuffer";

	return (req, res, next) => {
		if (!skip?.(req, res)) {
			const oldWrite = res.write
			const oldEnd = res.end;

			res.write = function () {
				if (arguments[0]?.length > 0) {
					if (!res[bufferName]) res[bufferName] = [];
					res[bufferName].push(arguments[0]);
				}
				return oldWrite.apply(res, arguments);
			};

			res.end = function () {
				if (arguments[0]?.length > 0) {
					if (!res[bufferName]) res[bufferName] = [];
					res[bufferName].push(arguments[0]);
				}
				return oldEnd.apply(res, arguments);
			};
		}

		next();
	}
}

/*
Add a default token in following condition,
	* token named ":res-body"
	* response body buffer named "bodyBuffer"
	* normal statusCode less than 400
	* convert to text
	* prifixed with line-break and "Res-body: "
	* utf8

In any other condition, add the token with your own code. 
*/
function addToken() {
	morgan.token("res-body", (req, res) => {
		if (res.bodyBuffer && res.statusCode < 400) {
			return "\nRes-body: " + Buffer.concat(res.bodyBuffer).toString('utf8');
		}
	});
}

//module exports
module.exports = {
	createMiddleware,

	addToken,
};
