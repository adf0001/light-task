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
		"updated_at"  DATETIME NOT NULL,
		"created_at"  DATETIME NOT NULL,
		"expire_at"  DATETIME NOT NULL,
		"done_at"  DATETIME
	);
```

# RESTful api
	* create
		POST	/tasks/
			request
				{
					title: "title",
					expire_at: "YYYY-MM-DD" / "YYYY-MM-DD hh:mm:ss"
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

	* update
		PUT		/tasks/{id}
			request
				{
					title: "title",
					expire_at: "YYYY-MM-DD" / "YYYY-MM-DD hh:mm:ss"
				}

			response
				refer to create

	* update: done
		POST		/tasks/{id}/done		//update `done_at` to current time
			response
				refer to create
	
	* delete
		DELETE		/tasks/{id}
			response
				refer to create
	
	* retrieve
		GET		/tasks/
		GET		/tasks/{id}
		GET		/tasks/expire/{YYYY-MM-DD|YYYY-MM-DD hh:mm:ss|today}

			response
				refer to create


