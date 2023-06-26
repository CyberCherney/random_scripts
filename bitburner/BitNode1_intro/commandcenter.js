/** @param {NS} ns */

// imports the server and hacknet server array populating functions
import { scan, hacknetServers } from "basic.js";

// MANUAL OVERRIDE TOGGLE
//const OVERRIDE = true;

export async function main(ns) {

	// debugging toggles
	ns.clearLog();
	ns.disableLog('scp');
	ns.disableLog('getServerRequiredHackingLevel')
	//ns.tail();


	// create a variable array with all servers
	var hosts = scan(ns);


	// checks what hosts have root
	var rooted = isRooted(hosts, ns);


	// function that determines hosts to target and which action to take
	decision(rooted, hosts, ns);

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


// makes the decision of which host is to be targeted and the action to take
function decision(rooted, hosts, ns) {

	// initialized my hacking level
	var lvl = ns.getHackingLevel();


	// sets basic variables for use
	var highestMax = '';
	var topDog = '';
	var dollars = 0;


	// loops through rooted hosts and checks if the max cash is higher than the previous value
	// if the new cash variable is higher it is checked against the host hacking lvl
	// then placed as the variable topDog
	for (let i = 0; i < rooted.length; i++) {
		var cash = ns.getServerMaxMoney(rooted[i]);
		var hackingReq = ns.getServerRequiredHackingLevel(rooted[i]);
		if (cash > dollars && rooted[i] != 'home') {
			dollars = cash;

			if (hackingReq < lvl) {
				topDog = rooted[i];
			}
		}
	}
	ns.print('Top dog is ' + topDog);


	// loops through all hosts and finds the highest cash value from any of them
	// outputs the highestMax variable
	for (let i = 0; i < hosts.length; i++) {
		var cash = ns.getServerMaxMoney(hosts[i]);
		var hackingReq = ns.getServerRequiredHackingLevel(hosts[i]);
		if (cash > dollars && hosts[i] != 'home') {
			dollars = cash;
			var highestMax = hosts[i]
		}
	}


	// finds the security and cash numbers of the determined target
	// compares current values to arbitrary calculations to determine action of my scripts
	var min = ns.getServerMinSecurityLevel(topDog);
	var current = ns.getServerSecurityLevel(topDog);

	var maxDollars = ns.getServerMaxMoney(topDog);
	var dollars = ns.getServerMoneyAvailable(topDog);
	var percentFull = dollars / maxDollars;
	if (current > (min + 1)) {
		var action = 'weaken';
	} else if (percentFull < .9) {
		var action = 'grow';
	} else {
		var action = 'hack';
	}


	// writes then transfers the action and hosts to all rooted hosts in json form
	const target = { 'host': topDog, 'action': action, 'endHost': highestMax };
	const json = JSON.stringify(target);
	ns.print(json);
	ns.write('target.txt', json, 'w');

	for (let i = 0; i < rooted.length; i++) {
		ns.scp('target.txt', rooted[i]);
	}

	var hacknets = hacknetServers(ns);

	for (let i = 0; i < hacknets.length; i++) {
		ns.scp('target.txt', hacknets[i]);
	}

	var ownedServers = ns.getPurchasedServers();

	for (let i = 0; i < ownedServers.length; i++) {
		ns.scp('target.txt', ownedServers[i]);
	}

}