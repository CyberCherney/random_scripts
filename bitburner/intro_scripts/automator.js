
/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await ns.asleep(50000);
		await ns.run('crawler.js');
		await ns.run('commandcenter.js');
}
}