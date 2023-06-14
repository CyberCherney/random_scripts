/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	var noders = ns.hacknet.numNodes();
	if (noders == 0) {
		ns.hacknet.purchaseNode();
		ns.exit();
	}

	var file = ns.read('target.txt');
	var json = JSON.parse(file);
	var host = json.endHost;
	
	var hashes = ns.hacknet.numHashes();
	var iter = Math.floor(hashes / 4);
	for (let i=0; i < iter; i++) {
		if (ns.hasRootAccess(host)) {
			if (ns.getServerMinSecurityLevel(host) > 1) {
				ns.hacknet.spendHashes("Reduce Minimum Security", host);
			} else if (ns.getServerMaxMoney(host) < 10000000000000) {
				ns.hacknet.spendHashes("Increase Maximum Money", host);
			} else {
				ns.hacknet.spendHashes("Improve Studying");
				//ns.hacknet.spendHashes("Improve Gym Training");
			}
		} else {
			ns.hacknet.spendHashes("Sell for Money");
		}
	}

	
	const loops = 0;
	for (let i=0; i< loops; i++) {
		var nodes = ns.hacknet.numNodes();
		//ns.print(nodes);
		var nodeCost = ns.hacknet.getPurchaseNodeCost();
		var array = [nodeCost,,,,]
		var cost = array[0];
		for (let j = 0; j < nodes; j++) {
			var coreCost = ns.hacknet.getCoreUpgradeCost(j);
			var cacheCost =  ns.hacknet.getCacheUpgradeCost(j);
			var ramCost = ns.hacknet.getRamUpgradeCost(j);
			var levelCost = ns.hacknet.getLevelUpgradeCost(j);
			array = [nodeCost, coreCost, cacheCost, ramCost, levelCost];
			//ns.print(cost);
			for (let k = 0; k < 5; k++) {
				//ns.print(array[k]);
				if (array[k] <= cost) {
					var cost = array[k];
					var upgrade = array.indexOf(cost);
					//ns.print(upgrade);
					var nodeNumber = j;
					//ns.print(nodeNumber);
					//ns.print(cost + ' ' + upgrade + ' ' + nodeNumber);
				}
			}
		}
		if (ns.getServerMoneyAvailable('home') > cost) {
			//ns.print('upgrade ' + upgrade);
			//ns.print('cost ' + cost);
			if (upgrade == 0) {ns.hacknet.purchaseNode();}
			else if (upgrade == 1) {ns.hacknet.upgradeCore(nodeNumber);}
			else if (upgrade == 2) {ns.hacknet.upgradeCache(nodeNumber);}
			else if (upgrade == 3) {ns.hacknet.upgradeRam(nodeNumber);}
			else if (upgrade == 4) {ns.hacknet.upgradeLevel(nodeNumber);}
		}
	}
}