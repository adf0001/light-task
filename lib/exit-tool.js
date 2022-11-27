
/*
an exit tool

options
	.killParent
		set true to kill the parent process
	.exitCode
		the exit code
	.delay
		the delay milliseconds
*/
module.exports = function (options) {
	var { killParent, exitCode, delay } = options;

	setTimeout(() => {
		//kill parent process, like supervisor.
		if (killParent && process.ppid) process.kill(process.ppid);

		process.exit(exitCode || 0);
	}, delay || 0);
}
