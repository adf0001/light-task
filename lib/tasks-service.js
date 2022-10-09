
var express = require('express');
var bodyParser = require('body-parser');

/*
loadResource(db)

load resource of tasks service

	db
		a sqlite db.

return an express router
*/
module.exports = function (db) {
	var router= express.Router();
	var jsonParser = bodyParser.json({ extended: false, limit: '500kb', parameterLimit: 100000 });

	//* create, POST	/
	var stateInsert = db.prepare(
		"INSERT INTO `tasks`( `title`, expire_at,updated_at,created_at) " +
		"VALUES(@title,@expire_at,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)"
	);

	var stateGetInsert = db.prepare(
		"SELECT * from `tasks` WHERE rowid = @lastInsertRowid;"
	);

	var regUtc = /^\d\d\d\d\-\d\d-\d\d\s\d\d\:\d\d:\d\d$/;
	var regTitle = /\S+/;

	function endError(res, code, str) {
		res.status(code).json({ error: str }).end();
	}
	function endRows(res, code, str, rows) {
		res.status(code).json({ msg: str, rows: rows }).end();
	}

	//return reason if fail
	function verifyCreate(data) {
		if (!data?.title?.match(regTitle)) return "title";
		if (!data?.expire_at?.match(regUtc)) return "expire_at";
	}

	router.post("/", jsonParser, (req, res) => {
		//console.log(req.body);
		var vr = verifyCreate(req.body);
		if (vr) return endError(res, 400, "format fail, " + vr);

		var info = stateInsert.run(req.body);
		if (!(info.changes > 0)) return endError(res, 500, "fail to create");

		var rows = stateGetInsert.all(info);
		//console.log(rows);
		endRows(res, 200, "OK", rows);
	});

	//* update,	PUT	/

	var stateUpdate = db.prepare(
		"UPDATE `tasks` " +
		"SET `title`=@title, expire_at=@expire_at,updated_at=CURRENT_TIMESTAMP " +
		"WHERE id=@id " +
		"	and (`title`!=@title or expire_at!=@expire_at)"
	);
	var stateGetById = db.prepare(
		"SELECT * from `tasks` WHERE id = @id;"
	);

	router.put("/", jsonParser, (req, res) => {
		var vr = verifyCreate(req.body);
		if (vr) return endError(res, 400, "format fail, " + vr);

		var info = stateUpdate.run(req.body);
		if (!(info.changes > 0)) return endError(res, 500, "nothing updated");

		var rows = stateGetById.all(req.body);
		endRows(res, 200, "OK", rows);
	});

	//* update: done,	POST	/{id}/done		//update `done_at` to current time

	var stateUpdateDone = db.prepare(
		"UPDATE `tasks` " +
		"SET done_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP " +
		"WHERE id=@id"
	);

	router.put("/:id/done", (req, res) => {
		var info = stateUpdateDone.run(req.params);
		if (!(info.changes > 0)) return endError(res, 500, "nothing changed");

		var rows = stateGetById.all(req.params);
		endRows(res, 200, "OK", rows);
	});

	//* delete,	DELETE	/{id}
	var stateDelete = db.prepare(
		"DELETE FROM `tasks` " +
		"WHERE id=@id"
	);
	router.delete("/:id", (req, res) => {
		var rows = stateGetById.all(req.params);	//get firstly
		if (!(rows?.length > 0)) return endError(res, 404, "unfound");

		var info = stateDelete.run(req.params);
		if (!(info.changes > 0)) return endError(res, 500, "nothing changed");

		endRows(res, 200, "OK", rows);
	});

	//* retrieve: all,	GET		/
	var stateGetAll = db.prepare(
		"SELECT * from `tasks`;"
	);

	router.get("/", (req, res) => {
		var rows = stateGetAll.all();
		endRows(res, 200, "OK", rows);
	});

	//* retrieve: single,	GET		/{id}
	router.get("/:id", (req, res) => {
		var rows = stateGetById.all(req.params);
		if (!(rows?.length > 0)) return endError(res, 404, "unfound");

		endRows(res, 200, "OK", rows);
	});

	//* retrieve: expire,	GET		/expire/YYYY-MM-dd hh:mm:ss

	var stateGetExpire = db.prepare(
		"SELECT * from `tasks` WHERE done_at is null and expire_at <= @expire_at;"
	);

	router.get("/expire/:expire_at", (req, res) => {
		var rows = stateGetExpire.all(req.params);
		endRows(res, 200, "OK", rows);
	});

	return router;
};
