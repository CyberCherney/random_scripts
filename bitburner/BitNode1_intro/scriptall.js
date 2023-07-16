/** @param {NS} ns */

import { scan, hacknetServers, runScript } from "basic.js";


// finds all servers, transfers a script, then runs it
// used when I need rep/xp
export async function main(ns) {
	ns.tail();
	ns.clearLog();
	ns.disableLog('scan');
	ns.disableLog('scp');
	ns.disableLog('exec');
	ns.disableLog('sleep');
	ns.disableLog('getServerMaxRam');
	ns.disableLog('getServerUsedRam');
	ns.disableLog('killall');
	var script = await ns.prompt('Enter the script to run: ', {type: 'text'});
	if (!script) {var script = 'share.js'}

	var hosts = scan(ns);
	var hacknetHosts = hacknetServers(ns);
	var ownedHosts = ns.getPurchasedServers();
	
	
	for (let i = 0; i < hosts.length; i++) {
		runScript(ns, hosts[i], script, 'max', true);
	}

	for (let i = 0; i < hacknetHosts.length; i++) {
		runScript(ns, hacknetHosts[i], script, 'max', true);
	}

	for (let i = 0; i < ownedHosts.length; i++) {
		runScript(ns, ownedHosts[i], script, 'max', true);
	}	

	// function runScript(ns, host, script, threadCount, forceRerun)

}