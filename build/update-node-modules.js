/*
	Update /node_modules/ by user-defined replacement list.
*/

const path = require("path");

//------------------------------
// config

var replaceList = [
	"supervisor/lib/supervisor.js",
	[
		"spawn(exec, prog, {stdio: 'inherit'})", "spawn(exec, prog, {stdio: 'inherit', windowsHide: true})"
	]
];

// when installing this package, set the cwd()/INIT_CWD as the database directory. 
if (process.env.INIT_CWD) {
	replaceList.push(
		"../config.js",
		[
			"'./db/light-task.sqlite'", "'" + path.join(process.env.INIT_CWD, "light-task.sqlite").replace(/\\/g, "\\\\") + "'"
		],
	)
}

//------------------------------
// process

var replace_file_by_list = require("replace-file-by-list");

var updateCount = replace_file_by_list(replaceList, { srcDir: __dirname + "/../node_modules/" });

//final message
if (updateCount > 0) console.log("\ndirectory /node_modules/ has been updated.");
else console.log("\nnothing updated");
