/** @param {NS} ns */
// finds all servers, transfers a share script, then runs it
// used when I need rep
export async function main(ns) {
	ns.tail();
	var allhosts = ns.scan();
	for (let i = 0; i < allhosts.length; i++) {
		var iter = ns.scan(allhosts[i]);
		for (let k=0; k < iter.length; k++) {
			if (allhosts.indexOf(iter[k]) == -1) {
				ns.print(iter[k]);
				allhosts.push(iter[k]);

			}
		}
	}
	for (let i = 0; i < allhosts.length; i++) {
		ns.scp('share.js', allhosts[i]);
		var max = ns.getServerMaxRam(allhosts[i]);
		var used = ns.getServerUsedRam(allhosts[i]);
		var ram = max - used;
		if (ram >= 4) {
			var threads = Math.floor(ram / 4);
			ns.exec('share.js', allhosts[i], threads);
		}
	}
}