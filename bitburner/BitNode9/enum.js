/** @param {NS} ns */
// lazy file to find $$s of hosts
// can specify parent or host to find server parent and target $$ respectively 
export async function main(ns) {
	ns.clearLog();
	ns.tail();
	ns.disableLog('disableLog');
	ns.disableLog('scan');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	const player = ns.getPlayer();
	var allhosts = ns.scan();
	var parents = [,];
	for (let i = 0; i < allhosts.length; i++) {
		var iter = ns.scan(allhosts[i]);
		for (let k=0; k < iter.length; k++) {
			if (allhosts.indexOf(iter[k]) == -1) {
				allhosts.push(iter[k]);
				parents.push(allhosts[i] + ' : ' + iter[k]);
			}
		}
	}
	ns.print(allhosts);
	for (let c = 0; c < allhosts.length; c++) {
		var root = ns.hasRootAccess(allhosts[c]);
		if (root == true) {
			var maxMoney = ns.getServerMaxMoney(allhosts[c]);
			var money = ns.getServerMoneyAvailable(allhosts[c]);
			if (maxMoney != 0 && money != 0) {
			ns.print(allhosts[c] + ' has is ' + money + ' of ' + maxMoney + '. ' + root);
			}
		}
	}
	
	if (ns.args[0] == 'parent') {
		ns.print(parents);
	} else if (ns.args[0] == 'host') {
		var file = ns.read('target.txt');
		var json = JSON.parse(file);
		var host = json.host;
		ns.print('-------');
		ns.print(ns.getServerMoneyAvailable(host) + ' of ' + ns.getServerMaxMoney(host));
		ns.print('Minimum security is ' + ns.getServerMinSecurityLevel(host));
		ns.print('-------');
	}

}