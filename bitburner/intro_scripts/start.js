/** @param {NS} ns */
// basic script to initialize text documents and start automator.js
export async function main(ns) {
	await ns.write('ram.txt', '1', 'w');
	await ns.write('host.txt', 'n00dles', 'w');
	ns.run('automator.js');
	ns.asleep(10000);
	await ns.run('homeenum.js');
}