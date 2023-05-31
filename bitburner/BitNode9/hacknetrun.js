/** @param {NS} ns */
import { hacknetServers, runScript } from 'basic.js';

// for running a script on all bought hacknet servers
export async function main(ns) {
	ns.tail();
	ns.clearLog();
	const command = await ns.prompt("Select the desired mode: ", {
		type: "select",
		choices: ["force", "start", "kill"]
	});
	const servers = hacknetServers(ns);
	ns.print(servers);

	if (command == "force" || command == "kill") {
		ns.print('killing processes');
		for (let i = 0; i < servers.length; i++) {
			ns.killall(servers[i])
		}
	}

	if (command == "force" || command == "start") {
		var script = await ns.prompt('What script should be run?', {type: 'text'});
		if (!script) {script = 'grow.js'}
		ns.print('starting script: ' + script);
		for (let i = 0; i < servers.length; i++) {
			runScript(ns, servers[i], script, 'max', false);
		}
	}


}