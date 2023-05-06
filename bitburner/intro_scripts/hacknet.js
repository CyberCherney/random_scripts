/** @param {NS} ns */
// uses some equations i estimated to buy nodes based on the most profitable ones
// runs 40 times since many level upgrades are cheap and ought be bought in bulk
export async function main(ns) {
	ns.clearLog();
	ns.tail();
	var nodes = ns.hacknet.numNodes();
	if (nodes == 0) {
		ns.hacknet.purchaseNode();
	}
	for (let x = 0; x < 40; x++) {
		var champ = [0,,,];
		for (let i = 0; i < nodes; i++) {
			var stats = ns.hacknet.getNodeStats(i);
			var level = stats.level;
			var ram = stats.ram;
			var core = stats.cores;
			var levelDollar = 3.172 + .215 * ram + .613 * core;
			var levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(i);
			var moneyPerCost = levelDollar / levelUpgradeCost;
			if (moneyPerCost > champ[0]) {
				champ[0] = moneyPerCost;
				champ[1] = 'level';
				champ[2] = i;
			}
			var ramDollar = 0.143 * level + (core - 1) * (0.049);
			var ramUpgradeCost = ns.hacknet.getRamUpgradeCost(i);
			moneyPerCost = ramDollar / ramUpgradeCost;
			if (moneyPerCost > champ[0]) {
				champ[0] = moneyPerCost;
				champ[1] = 'ram';
				champ[2] = i;
			}
			var coreDollar = (1.04 ** ram) * 0.657 * level;
			var coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(i);
			moneyPerCost = coreDollar / coreUpgradeCost;
			if (moneyPerCost > champ[0]) {
				champ[0] = moneyPerCost;
				champ[1] = 'core';
				champ[2] = i;
			}
		}
		var nodeCost = ns.hacknet.getPurchaseNodeCost();
		var cash = ns.getServerMoneyAvailable('home');
		if (champ[0] > nodeCost && cash > champ[0]) {
			ns.hacknet.purchaseNode();
		} else if (cash > champ[0] && champ[0] > 0) {
			if (champ[1] == 'level') {
				ns.hacknet.upgradeLevel(champ[2], 1);
				ns.print('Upgrading Level on ' + champ[2])
			} else if (champ[1] == 'ram') {
				ns.print('Upgrading Ram on ' + champ[2])
				ns.hacknet.upgradeRam(champ[2], 1);
			} else if (champ[1] == 'core') {
				ns.print('Upgrading Core on ' + champ[2])
				ns.hacknet.upgradeCore(champ[2], 1);
			}
		}
}
	ns.print(champ);
}