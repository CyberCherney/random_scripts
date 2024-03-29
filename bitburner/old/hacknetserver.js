/** @param {NS} ns */


// MANUAL OVERRIDE TOGGLE
//const OVERRIDE = true;

export async function main(ns) {

	// debugging toggles
	ns.clearLog();
	ns.disableLog("getServerMinSecurityLevel");
	//ns.tail();


	// grabs number of nodes, checks if 0 then buys one
	// used primarily to enter loop
	var noders = ns.hacknet.numNodes();
	if (noders == 0) {
		ns.hacknet.purchaseNode();
		ns.exit();
	}
	
	// determines end host to target
	// if OVERRIDE is on uses host in variable 
	// otherwise reads target json file and defines the host variable
	if (typeof OVERRIDE != 'undefined') {
		var host = 'omega-net';
		var securitySwitch = 6.7;
	} else {
		var file = ns.read('target.txt');
		var json = JSON.parse(file);
		var host = json.endHost;
		//ns.print(host);
		var securitySwitch = 1;
		var root = ns.hasRootAccess(host);
		var hackLvlReq = ns.getServerRequiredHackingLevel(host);
		var hackLvl = ns.getHackingLevel();
		//ns.print(root)
	}


	// hash spending loop, default is selling for money
	// if end host is hackable reduces security till minimum then increases cash till maximum
	// once above is achieved hashes are spend increasing study/ training efficiency
	// if OVERRIDE is active it forces security reducing and cash increase on designated host
	var hashes = ns.hacknet.numHashes();
	var iter = Math.floor(hashes / 4);
	for (let i=0; i < iter; i++) {
		if (hackLvl >= hackLvlReq && root) {
			if (ns.getServerMinSecurityLevel(host) > securitySwitch) {
				ns.hacknet.spendHashes("Reduce Minimum Security", host);
			} else if (ns.getServerMaxMoney(host) < 10000000000000) {
				ns.hacknet.spendHashes("Increase Maximum Money", host);
			} else {
				ns.hacknet.spendHashes("Improve Studying");
				//ns.hacknet.spendHashes("Improve Gym Training");
			}
		} else {
			//ns.hacknet.spendHashes("Improve Studying");
			ns.hacknet.spendHashes("Sell for Money");
		}
	}


	// hard coded stop so saving for augments later is easy
	var sanityCheck = ns.hacknet.getCoreUpgradeCost(0);
	var costLimit = 100000000;
	if (typeof ns.args[0] != 'undefined') {
		var loops = ns.args[0];
	} else if (sanityCheck < costLimit) {
		var upgradeCost = ns.hacknet.getLevelUpgradeCost(0);
		var homeMoney = ns.getServerMoneyAvailable('home');
		var loops = Math.floor(homeMoney/upgradeCost);
		//ns.print(loops);
	} else {
		var loops = 0;
	}


	// finds lowest cost upgrade and purchases it
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