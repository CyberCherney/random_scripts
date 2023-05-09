/** @param {NS} ns */
export async function main(ns) {
	ns.tail();
	var arg = ns.args[0];
	await ns.weaken(arg);
	await ns.hack(arg);
	ns.closeTail();
	ns.spawn('homeenum.js');
}