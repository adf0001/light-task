# light-task
A simple task application

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

	CREATE TABLE "tasks" (
		"id"  INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
		"title"  text NOT NULL,
		"detail"  TEXT,
		"updated_at"  DATETIME NOT NULL,
		"created_at"  DATETIME NOT NULL,
		"expire_date"  DATETIME NOT NULL,
		"done_at"  DATETIME
	);

