/** @param {NS} ns */
import { hacknetServers, runScript } from 'basic.js';

// for running a script on all bought hacknet servers
export async function main(ns) {
	ns.tail();
	var servers = hacknetServers(ns);
	ns.print(servers)
	for (let i=0; i < servers[i].length; i++) {
		runScript(ns, servers[i], 'weaken.js', 'max', true);
	}
}