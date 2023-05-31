/** @param {NS} ns */
// finds all servers, transfers a script, then runs it
// used when I need rep/xp
export async function main(ns) {
	ns.tail();
	var script = ns.prompt('Enter the script to run: ', {type: 'text'});
	if (!script) {var script = 'share.js'}
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
		ns.scp(script, allhosts[i]);
		var max = ns.getServerMaxRam(allhosts[i]);
		var used = ns.getServerUsedRam(allhosts[i]);
		var ram = max - used;
		var scriptRam = ns.getScriptRam(script);
		if (ram >= scriptRam) {
			var threads = Math.floor(ram / scriptRam);
			ns.exec(script, allhosts[i], threads);
		}
	}
}