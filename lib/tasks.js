
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

	//create, POST	/tasks/
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
		var expire_at = req.body.expire_at;
		if (!expire_at || !expire_at.match(regUtc)) {
			res.status(400).json({ msg: "utc format fail" });
			res.end();
			return;
		}
		stateInsert.run(req.body);
		var ret = stateGetInsert.all();
		//console.log(ret);
		res.json({ msg: "ok", rows: ret });
		res.end();
	});

};
