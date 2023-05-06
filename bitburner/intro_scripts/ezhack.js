/** @param {NS} ns */

// this script is used best with my commandcenter.js script
//  it takes in two files which declare the host and the action to take
// if neither are specified it defaults to hacking the host it is on
export async function main(ns) {
	while(true) {
		
		if (ns.fileExists('action.txt')) {
			var action = ns.read('action.txt');
		} else {
			var action = 'hack';
		}

		if (ns.fileExists('host.txt')) {
			var host = ns.read('host.txt');
		} else {
			var host = ns.args[0];
		}

		if (action == 'hack') {
		await ns.hack(host);
		}
		if (action == 'weaken' || action == 'grow') {
		await ns.weaken(host);
		}
	}
}