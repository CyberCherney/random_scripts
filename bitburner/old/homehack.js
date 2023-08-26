/** @param {NS} ns */
export async function main(ns) {
	//ns.tail();
	var arg = ns.args[0];
	await ns.hack(arg);
	//ns.closeTail();
	await ns.run('homeenum.js');
}