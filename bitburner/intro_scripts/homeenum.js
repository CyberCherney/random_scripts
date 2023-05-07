/** @param {NS} ns */
export async function main(ns) {
	var mine = ns.getPurchasedServers();
	var allhosts = ns.scan('n00dles');
	for (let i = 0; i < allhosts.length; i++) {
		var iter = ns.scan(allhosts[i]);
		for (let k=0; k < iter.length; k++) {
			var cash = ns.getServerMoneyAvailable(allhosts[i]);
			if (cash != 0 && allhosts[i] != ns.read('host.txt') && allhosts[i] != 'home' && ns.hasRootAccess(allhosts[i])) {
				ns.spawn('homehack.js', 3900, allhosts[i]);
			}
			if (allhosts.indexOf(iter[k]) == -1 && !mine.includes(iter[k])) {
				allhosts.push(iter[k]);

			}
		}
	}
}