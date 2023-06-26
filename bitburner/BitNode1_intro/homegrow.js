/** @param {NS} ns */
export async function main(ns) {
	var arg = ns.args[0];
	await ns.grow(arg);
	await ns.run('homeenum.js');
}