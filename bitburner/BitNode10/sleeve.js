/** @param {NS} ns */
export async function main(ns) {


	//ns.tail();
	ns.clearLog();
	var sleeves = ns.sleeve.getNumSleeves();


	while (true) {

		var breakpoint = 0;

		for (let i=0; i < sleeves; i++) {

			var jsonSleeve = ns.sleeve.getSleeve(i);
			var shock = jsonSleeve.shock;
			var sync = jsonSleeve.sync;
			
			if (shock > 0) {
				ns.sleeve.setToShockRecovery(i);
			} else if (sync < 100) {
				ns.sleeve.setToSynchronize(i);
			} else {
				breakpoint++;
				ns.print(breakpoint);
			}
			
			
		}

		if (breakpoint === sleeves) {
			ns.kill('sleeve.js');
		} else {
			await ns.sleep('100000');
		}

	}
}