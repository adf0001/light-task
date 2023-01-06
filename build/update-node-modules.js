/*
	Update /node_modules/ by user-defined replacement list.
*/

//------------------------------
// config

var replaceList = [
	"supervisor/lib/supervisor.js", [
		"spawn(exec, prog, {stdio: 'inherit'})", "spawn(exec, prog, {stdio: 'inherit', windowsHide: true})"
	]
];

//------------------------------
// process

var replace_file_by_list = require("replace-file-by-list");

var updateCount = replace_file_by_list(replaceList, { srcDir: __dirname + "/../node_modules/" });

//final message
if (updateCount > 0) console.log("\ndirectory /node_modules/ has been updated.");
else console.log("\nnothing updated");
