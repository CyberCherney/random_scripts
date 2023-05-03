/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	ns.disableLog('getServerRequiredHackingLevel');
	ns.disableLog('getServerNumPortsRequired')
	ns.print('Starting');
	crawler(ns);
}

// Basic function to find all available hosts
function crawler(ns) {
	var mine = ns.getPurchasedServers();
	var allhosts = ns.scan();
	var unique = allhosts;
	for (let i = 0; i < unique.length; i++) {
		var iter = ns.scan(unique[i]);
		for (let k=0; k < iter.length; k++) {
			if (allhosts.indexOf(iter[k]) == -1 && mine.indexOf(iter[k] == -1)) {
				allhosts.push(iter[k]);
			}
		}
	}
	unique = allhosts.filter(function(elem, index, self) {
    	return index === self.indexOf(elem);
	})
	ns.print(unique);
	ownedServers(mine, ns);
	scanner(unique, ns);
}

// transition function for checking if high enough hack level to root
function scanner(allhosts, ns) {
	const hacklvl = Number(ns.getHackingLevel());
	for (let i = 0; i < allhosts.length; i++) {
		var reqlvl = Number(ns.getServerRequiredHackingLevel(allhosts[i]));
		//ns.print(hacklvl);
		//ns.print(reqlvl);
		if (hacklvl >= reqlvl) {
			var root = ns.hasRootAccess(allhosts[i]);
			//ns.print(root);
			rooter(root, allhosts[i], ns);
		}
}
}

// Checks then runs all port openning tools, if enough are open runs nuke
function rooter(rootAccess, host, ns) {
	//ns.print('Entered rooter function');
	if (rootAccess == false) {
		var openPort = 0;
		//		ns.print(host);
		if (ns.fileExists("BruteSSH.exe", "home")) {
			ns.brutessh(host);
			openPort++;
		}
		if (ns.fileExists("HTTPWorm.exe", "home")) {
			ns.httpworm(host);
			openPort++;
		}
		if (ns.fileExists("SQLInject.exe", "home")) {
			ns.sqlinject(host);
			openPort++;
		}
		if (ns.fileExists("relaySMTP.exe", "home")) {
			ns.relaysmtp(host);
			openPort++;
		}
		if (ns.fileExists("FTPCrack.exe", "home")) {
			ns.ftpcrack(host);
			openPort++;
		}
	}
		var required = ns.getServerNumPortsRequired(host);
		ns.print(openPort + ' ports open of ' + required + ' ports required');
		if (openPort >= required && rootAccess == false) {
			//ns.print('Running nuke');
			ns.nuke(host);
		}
		var ram = Number(ns.getServerMaxRam(host));
		if (ram > 0) {
		ezhack(host, ns);
		}
}

// places my basic hacking script, which is 1.95gb
// sets the proper number of threads and gives it the parameter of the host it's on
// (useful as a fallback)
function ezhack(host, ns) {
	var check = ns.isRunning('ezhack.js', host, host);
	ns.print(check + ' for ezhack running on ' + host);
	if (check == false  && host != 'home') {
		ns.scp('ezhack.js', host);
		var ram = Number(ns.getServerMaxRam(host));
		ns.print(ram);
		if (ram >= 1.95) {
			var threads = Math.floor(ram / 1.95);
			ns.exec('ezhack.js', host, threads, host);
		}

	}
}

// places grow.js on owned servers
function ownedServers(host, ns) {
	for (let i=0; i < host.length; i++) {
		var check = ns.isRunning('grow.js', host[i], host[i]);
		ns.print(check + ' for grow running on ' + host[i]);
		if (check == false) {
			ns.scp('grow.js', host[i]);
			var ram = Number(ns.getServerMaxRam(host[i]));
			ns.print(ram);
			if (ram >= 1.95) {
				var threads = Math.floor(ram / 1.95);
				ns.exec('grow.js', host[i], threads, host[i]);
			}

		}
	}
}