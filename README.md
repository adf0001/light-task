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

# Databse &  RESTful api
	refer to task-service @ npm

# Console tool
```bat
	npm run start		//to start
	npm run	start:dev		//to start in develope mode
	npm run stop		//to stop
	npm run status		//to get the status

	light-task ( same as command "node cli.js" )
	light-task start [--foreground]
	light-task stop
	light-task status

	light-task add "title" "datetime"
		"datetime": a year-first datetime string, e.g. "2022-12-5" or "2012/12/25"
	
	light-task list --all
	light-task list --expire today
	light-task list --expire 2012/12/5
	light-task list				//same as --expire today
	light-task list <id>		//list single record by id

	light-task done <id>		//set done flag by id

	light-task remove <id>		//remove record by id

```

# CLI tool
```text
light-task cli, v1.0.2

Usage: light-task command [--options]

command:
    start               start the service, in background.
        --foreground    start in foreground
    stop                stop the service
    status              check the service status

    add 'title' 'expire'
                        add a task.
                        'title': a title string
                        'expire': a year-first datetime string, e.g. '2022-12-5' or '2012/12/25'

    list                list tasks. Without options, it's same as '--expire today'.
        <id>            list detail by task id
        --all           list all
        --expire today
                        list tasks that expire today
        --expire 'datetime'
                        list by an appointed expire datetime
    done <id>           set done flag by task id
    remove <id>         remove by task id

```

# Swagger tool
	Default at http://127.0.0.1:8071/swagger