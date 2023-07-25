/** 
 * this script is effectively an 'easy afk hack everything' script
 * no doubt it needs improvement to minmax but I'm not sure how far bitburner goes
 * in short I have a hacking script named 'ezhack.js' which is placed on machines crawler.js roots
 * then it is run with the max amount of threads and fed two files: action.txt and host.txt
 * action determines if it will hack or weaken, host determines the target
 * commandcenter.js controls what is in those files and placing them on rooted machines
 * server buyer automates filling out and upgrading servers owned
 * hacknet automates the nodes and upgrading them in a semi-efficient way
 * ends by spawning itself
*/

/** @param {NS} ns */
export async function main(ns) {
	ns.run('homeenum.js');
	while (true) {
		await ns.run('basic.js');
		await ns.run('commandcenter.js');
		await ns.run('hacknetserver.js');
		await ns.asleep(10000);
		if (ns.read('ram.txt') != 'done') {
			await ns.run('serverbuyer.js')
			//await ns.asleep(50000);
		}

		if (!ns.isRunning('homehack.js', 'home')) {
			ns.run('homeenum.js');
		}

		if (ns.bladeburner.inBladeburner()) {
			//ns.run('bladeburner.js')
		}

	}
}