
var config = require('../config.js');

var better_sqlite3 = require('better-sqlite3');
var db = new better_sqlite3(config.sqlite_db, { fileMustExist: true });
console.log("open sqlite db ok, " + config.sqlite_db);

module.exports = db;
