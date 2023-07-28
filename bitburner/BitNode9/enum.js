/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	ns.tail();
	ns.disableLog('disableLog');
	ns.disableLog('scan');
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerMaxMoney');
	ns.disableLog('getServerGrowth');
	const player = ns.getPlayer();
	//var allhosts = ns.scan();
	var allhosts = ['home']
	var parents = [,];

	var testStr = '{';



	for (let i = 0; i < allhosts.length; i++) {
		var iter = ns.scan(allhosts[i]);
		for (let k=0; k < iter.length; k++) {
			if (allhosts.indexOf(iter[k]) == -1) {
				allhosts.push(iter[k]);

				var tempStr = '"' + iter[k] + '":"' + allhosts[i] + '" ,';
				var testStr = testStr + tempStr;

				parents.push(allhosts[i] + ' : ' + iter[k]);
			}
		}
	}

	ns.print(parents);

	for (let c = 0; c < allhosts.length; c++) {
		var root = ns.hasRootAccess(allhosts[c]);
		if (root == true) {
			var maxMoney = ns.getServerMaxMoney(allhosts[c]);
			var money = ns.getServerMoneyAvailable(allhosts[c]);
			if (maxMoney != 0 && money != 0) {
				
				var growthFactor =  ns.getServerGrowth(allhosts[c]);

				//ns.print(allhosts[c] + ' has is ' + money + ' of ' + maxMoney + ' ' + root);
				//ns.print('--> Growth ' + growthFactor);
			}
		}
	}
	


		var file = ns.read('target.txt');
		var json = JSON.parse(file);
		var host = json.host;
		ns.print('-------');
		ns.print(ns.getServerMoneyAvailable(host) + ' of ' + ns.getServerMaxMoney(host));
		ns.print('Minimum security is ' + ns.getServerMinSecurityLevel(host));
		ns.print('-------');

		testStr = testStr.slice(0,-2)
		testStr = testStr + '}'
		var testJson = JSON.parse(testStr)

		const hackerFactions = ['CSEC', 'avmnite-02h', 'I.I.I.I', 'run4theh111z']
		const hackerFactionNames = ['CSEC', 'NiteSec', 'BlackHand', 'Bitrunners']

		
		for (let i=0; i < hackerFactions.length; i++) {
			var lever = true;
			var rootParent = testJson[hackerFactions[i]]
			var tempStr = '["' + hackerFactions[i] + '","' + rootParent + '","'
			var esc = 0;
			while(lever) {
				var tempParent = testJson[rootParent]
				//await ns.print(tempParent)
				tempStr = tempStr + tempParent + '","'
				if (tempParent == 'home') {
					lever = false
				} else {
					rootParent = tempParent
				}
				esc++
				if (esc == '15') {
					lever = false
				}
			}
			var parentPath = tempStr.slice(0,-2) + ']'
			ns.print(parentPath)

		}


}