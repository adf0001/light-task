
var bodyParser = require('body-parser');

/*
resource loader: tasks

	app
		An expresion application.

	db
		a sqlite db.
*/
module.exports = function (app, db) {
	var jsonParser = bodyParser.json({ extended: false, limit: '500kb', parameterLimit: 100000 });

	//* create, POST	/tasks/
	var stateInsert = db.prepare(
		"INSERT INTO `tasks`( `title`, expire_at,updated_at,created_at) " +
		"VALUES(@title,@expire_at,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)"
	);

	var stateGetInsert = db.prepare(
		"SELECT * from `tasks` WHERE rowid = last_insert_rowid() ;"
	);

	var regUtc = /^\d\d\d\d\-\d\d-\d\d\s\d\d\:\d\d:\d\d$/;

	app.post("/tasks/", jsonParser, (req, res) => {
		//console.log(req.body);
		if (!req.body?.expire_at?.match(regUtc)) {
			res.status(400).json({ error: "utc format fail" }).end();
			return;
		}
		stateInsert.run(req.body);
		var ret = stateGetInsert.all();
		//console.log(ret);
		res.json({ msg: "ok", rows: ret }).end();
	});

	//* update,	PUT	/tasks/

	var stateUpdate = db.prepare(
		"UPDATE `tasks` " +
		"SET `title`=@title, expire_at=@expire_at,updated_at=CURRENT_TIMESTAMP " +
		"WHERE id=@id"
	);
	var stateGetById = db.prepare(
		"SELECT * from `tasks` WHERE id = @id;"
	);

	app.put("/tasks/", jsonParser, (req, res) => {
		if (!req.body?.expire_at?.match(regUtc)) {
			res.status(400).json({ error: "utc format fail" }).end();
			return;
		}
		stateUpdate.run(req.body);
		var ret = stateGetById.all(req.body);
		res.json({ msg: "ok", rows: ret }).end();
	});

	//* update: done,	POST	/tasks/{id}/done		//update `done_at` to current time

	var stateUpdateDone = db.prepare(
		"UPDATE `tasks` " +
		"SET done_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP " +
		"WHERE id=@id"
	);

	app.put("/tasks/:id/done", (req, res) => {
		stateUpdateDone.run(req.params);
		var ret = stateGetById.all(req.params);
		res.json({ msg: "ok", rows: ret }).end();
	});

	//* delete,	DELETE	/tasks/{id}
	var stateDelete = db.prepare(
		"DELETE FROM `tasks` " +
		"WHERE id=@id"
	);
	app.delete("/tasks/:id", (req, res) => {
		var ret = stateGetById.all(req.params);	//get firstly
		stateDelete.run(req.params);
		res.json({ msg: "ok", rows: ret }).end();
	});

	//* retrieve: all,	GET		/tasks/
	var stateGetAll = db.prepare(
		"SELECT * from `tasks`;"
	);

	app.get("/tasks/", (req, res) => {
		var ret = stateGetAll.all();
		res.json({ msg: "ok", rows: ret }).end();
	});

	//* retrieve: single,	GET		/tasks/{id}
	app.get("/tasks/:id", (req, res) => {
		var ret = stateGetById.all(req.params);
		res.json({ msg: "ok", rows: ret }).end();
	});

	//* retrieve: expire,	GET		/tasks/expire/YYYY-MM-dd hh:mm:ss

	var stateGetExpire = db.prepare(
		"SELECT * from `tasks` WHERE done_at is null and expire_at <= @expire_at;"
	);

	app.get("/tasks/expire/:expire_at", (req, res) => {
		var ret = stateGetExpire.all(req.params);
		res.json({ msg: "ok", rows: ret }).end();
	});


};
