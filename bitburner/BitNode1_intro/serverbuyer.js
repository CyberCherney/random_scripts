/** @param {NS} ns */
/** checks to see if you have all server slots filled
 * first fills them with 2GB ram servers
 * if full checks if ram text file is higher than server ram:
 *  - buy a new one if it is
 * runs a final check to see if any server is below the imported ram value
 * if no server is lower than ram.txt it increments it by one
*/

var costLimit = 2000000000;

export async function main(ns) {
	ns.disableLog('getServerMoneyAvailable');
	//ns.tail();
	ns.clearLog();
	var ramPower = ns.read('ram.txt');
	ns.print(ramPower);
	if (ramPower > 20) {
		ns.write('ram.txt', 'done', 'w');
	}

	const basecost = 110000;
	const owned = ns.getPurchasedServers();
	const max = ns.getPurchasedServerLimit();
	const name = 'raccoon-';
	var x = true;
	if (owned.length < max) {
		var ram = 2 ** ramPower;
		for (let i = 0; (i + owned.length) < 25; i++) {
			var money = ns.getServerMoneyAvailable('home');
			if (money > basecost) {
				ns.purchaseServer(name + String(i), ram);
			}
		}
	} else if (owned.length == max) {
		var x = 0;
		var i = 0;
		for (i = 0; i < owned.length; i++) {
			var ram = ns.getServerMaxRam(owned[i]); 

			var betterRam = 2 ** ramPower;
			ns.print(betterRam);
			if (betterRam > ram && ramPower < 21) {
				var cost = ns.getPurchasedServerCost(betterRam);
				var money = ns.getServerMoneyAvailable('home');
				ns.print('Money: ' + money + '   Cost: ' + cost);
				//ns.print(cost);
				if (money > cost && cost < costLimit) {
					ns.kill('grow.js', owned[i], owned[i]);
					ns.upgradePurchasedServer(owned[i], betterRam);
				}
			}
			if (betterRam == ram) {
				x++;
			}
		}
		ns.print('x='+x+' i='+i);
		if (x == i && ramPower < 21) {
			ramPower++;
			ns.write('ram.txt', ramPower, 'w');
		}
	}

}