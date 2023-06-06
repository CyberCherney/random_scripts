/** @param {NS} ns */

// this script is used best with my commandcenter.js script
//  it takes in two files which declare the host and the action to take
// if neither are specified it defaults to hacking the host it is on
export async function main(ns) {
	while(true) {
		
		if (ns.fileExists('target.txt')) {
			//ns.tail();
			const file = ns.read('target.txt');
			const json = JSON.parse(file);
			var action = json.action;
			var host = json.host;
			//ns.print(json);
			
		} else {
			var action = 'hack';
			var host = ns.args[0];
		}

		if (action == 'hack') {
		await ns.hack(host);
		} else if (action == 'weaken') {
		await ns.weaken(host);
		} else if (action == 'grow') {
		await ns.grow(host);
		}
	}
}