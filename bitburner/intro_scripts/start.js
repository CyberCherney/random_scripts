/** @param {NS} ns */
// basic script to initialize text documents and start automator.js
export async function main(ns) {
	await ns.run('grow.js', 1600, 'n00dles');
	await ns.write('ram.txt', '1', 'w');
	await ns.write('host.txt', 'n00dles', 'w');
	ns.run('automator.js');
}