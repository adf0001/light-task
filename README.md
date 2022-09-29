# light-task
A simple task application

# Framework
	nodejs, express.

# Deployment
	* Web service
		* RESTful api
			* api document
		* database
			* sqlite
		* log
			* log/Y/M/Y-M-D.log
	* Command tool
		* service control
			* unit test
		* pack/debug/release tool
		
# Component
	* web-server
	* database
	* control-tool

# Databse
	sqlite 3

```sql
	CREATE TABLE "tasks" (
		"id"  INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		"title"  text NOT NULL,
		"updated_at"  DATETIME NOT NULL,	-- UTC+0
		"created_at"  DATETIME NOT NULL,	-- UTC+0
		"expire_at"  DATETIME NOT NULL,	-- UTC+0
		"done_at"  DATETIME		-- UTC+0
	);
```

# RESTful api
	* create, POST	/tasks/
		request
			{
				title: "title",
				expire_at: "YYYY-MM-dd hh:mm:ss",		//UTC+0
			}

		response
			status 200
			{
				msg: "OK",
				rows:[
					{id,...},
					...
				]
			}

	* update,	PUT	/tasks/{id}
		request
			{
				title: "title",
				expire_at: "YYYY-MM-dd hh:mm:ss",
			}

		response
			refer to create

	* update: done,	POST	/tasks/{id}/done		//update `done_at` to current time
		response
			refer to create
	
	* delete,	DELETE	/tasks/{id}
		response
			refer to create
	
	* retrieve: all,	GET		/tasks/
		response
			refer to create
	* retrieve: single,	GET		/tasks/{id}
		response
			refer to create
	* retrieve: expire,	GET		/tasks/expire/YYYY-MM-dd hh:mm:ss
		response
			refer to create

