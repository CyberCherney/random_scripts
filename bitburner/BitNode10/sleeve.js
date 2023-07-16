/** @param {NS} ns */
export async function main(ns) {
	
	// Debug

	ns.tail();
	ns.clearLog();

	var sleeves = ns.sleeve.getNumSleeves();

	await sleeveInitialize(ns, sleeves);



}





// reduces shock to 0 and increases sync to 100

export function sleeveInitialize(ns, sleeves) {

	// sets loop
	var loop = true;

	while (loop) {

		var breakpoint = 0;

		for (let i=0; i < sleeves; i++) {

			// getSleeve returns json
			var jsonSleeve = ns.sleeve.getSleeve(i);
			var shock = jsonSleeve.shock;
			var sync = jsonSleeve.sync;
			

			if (sync < 100) {
				ns.sleeve.setToSynchronize(i); 
			} else if (shock > 0) {
				ns.sleeve.setToShockRecovery(i); 
			} else {
				breakpoint++;
				ns.print(breakpoint);
			}
		}
	
		if (breakpoint === sleeves) {
			loop = false;
		} else {
			ns.sleep('10000');
		}


	}
}