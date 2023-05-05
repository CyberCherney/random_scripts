/** @param {NS} ns */
/** checks to see if you have all server slots filled
 * first fills them with 2GB ram servers
 * if full checks if ram text file is higher than server ram:
 *  - buy a new one if it is
 * runs a final check to see if any server is below the imported ram value
 * if no server is lower than ram.txt it increments it by one
*/
export async function main(ns) {
	ns.disableLog('getServerMoneyAvailable');
	var ramPower = ns.read('ram.txt');
	ns.print(ramPower);
	const basecost = 110000;
	const owned = ns.getPurchasedServers();
	const name = 'raccoon-';
	var x = true;
	if (owned.length < 25) {
		var ram = 2 ** ramPower;
		for (let i = 0; (i + owned.length) < 25; i++) {
			var money = ns.getServerMoneyAvailable('home');
			if (money > basecost) {
				ns.purchaseServer(name + String(i), ram);
			}
		}
	} else if (owned.length == 25) {
		for (let i = 0; i < owned.length; i++) {
			var ram = ns.getServerMaxRam(owned[i]); 
			var money = ns.getServerMoneyAvailable('home');
			var betterRam = 2 ** ramPower;
			ns.print(betterRam);
			if (betterRam > ram) {
				var cost = basecost * betterRam /2;
				//ns.print(cost);
				if (money > cost) {
					ns.kill('grow.js', owned[i], owned[i]);
					ns.deleteServer(owned[i]);
					ns.purchaseServer(owned[i], betterRam);
				}
			}
			if (betterRam == ram) {
				var x = false;
			}
		}
		if (x == false) {
			ramPower++;
			ns.write('ram.txt', ramPower, 'w');
		}
	}

}