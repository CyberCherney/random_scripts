/** @param {NS} ns */

import { scan } from "basic.js";

export async function main(ns) {
	ns.clearLog();
	ns.disableLog('scp');
	var hosts = scan(ns);
	var rooted = isRooted(hosts, ns);
	decision(rooted, ns);
}

// checks if the hosts have been rooted
// rooted hosts are placed in a new array
function isRooted(hosts, ns) {
	var rooted = []
	for (let i = 0; i < hosts.length; i++) {
		var check = ns.hasRootAccess(hosts[i]);
		if (check) {
			rooted.push(hosts[i]);
		}
	}
	ns.print(rooted);
	return rooted;
}


// makes the decision of which host is to be targetted and to hack or weaken
// my bought servers are handling the growth spam for the time being
function decision(rooted, ns) {
	// this part will find the server with the highest money available
	// after finding it the server is crowned topDog
	var oldDog = ns.read('host.txt');
	var lvl = ns.getHackingLevel();

	var topDog = '';
	var dollars = 0;
	for (let i = 0; i < rooted.length; i++) {
		var cash = ns.getServerMaxMoney(rooted[i]);
		var hackingReq = ns.getServerRequiredHackingLevel(rooted[i]);
		if (cash > dollars && rooted[i] != 'home' && hackingReq < lvl) {
			dollars = cash;
			topDog = rooted[i];
		}
	}
	ns.print('Top dog is ' + topDog);


	// checks an arbitrary percentage threshhold I set of .75
	// likely will change this in the future after some math
	var min = ns.getServerMinSecurityLevel(topDog);
	var current = ns.getServerSecurityLevel(topDog);

	var maxDollars = ns.getServerMaxMoney(topDog);
	var dollars = ns.getServerMoneyAvailable(topDog);
	var percentFull = dollars / maxDollars;
	if (current > min) {
		var action = 'weaken';
	} else if (percentFull < .7) {
		var action = 'grow';
	} else {
		var action = 'hack';
	}

	// writes then transfers the action and hosts to all rooted hosts
	ns.write('action.txt', action, 'w');
	ns.write('host.txt', topDog, 'w');

	for (let i = 0; i < rooted.length; i++) {
		ns.scp('action.txt', rooted[i]);
		ns.scp('host.txt', rooted[i]);
	}
}