/** @param {NS} ns */

import { scan } from "basic.js";

export async function main(ns) {
	//ns.tail();
	const servers = scan(ns);

	var ram = ns.getServerMaxRam('home');
	var neededRam = ns.getScriptRam('homehack.js');
	var threads = Math.floor((ram - 40)/neededRam); 
	for (let i = 0; i < servers.length; i++) {
		if (ns.hasRootAccess(servers[i])) {
			var cash = ns.getServerMoneyAvailable(servers[i]);
			var max = ns.getServerMaxMoney(servers[i]);
			if ((cash/max) > .3 && servers[i] != ns.read('target.txt')) {
				ns.spawn('homehack.js', threads, servers[i]);
			} else {
				var file = ns.read('target.txt');
				var json = JSON.parse(file);
				ns.spawn('homehack.js', threads, json.host);
			}
		}
	}
}