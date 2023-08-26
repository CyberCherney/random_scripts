/** @param {NS} ns */

import { scan } from "basic.js";

export async function main(ns) {
	//ns.tail();
	const servers = scan(ns);

	var ram = ns.getServerMaxRam('home');
	var neededRam = ns.getScriptRam('homehack.js');
	var threads = Math.floor((ram - 70)/neededRam);
	if (threads < 0 || ns.scriptRunning("homehack.js", ns.getHostname())) {
		ns.kill('homeenum.js');
	} 
	for (let i = 0; i < servers.length; i++) {
		if (ns.hasRootAccess(servers[i])) {
			var cash = ns.getServerMoneyAvailable(servers[i]);
			var max = ns.getServerMaxMoney(servers[i]);
			if ((cash/max) > .3 && servers[i] != ns.read('target.txt')) {
				ns.run('homehack.js', threads, servers[i]);
			} else {
				var file = ns.read('target.txt');
				var json = JSON.parse(file);
				await ns.sleep(10);
				ns.run('homehack.js', threads, json.host);
				break
			}
		}
	}
}