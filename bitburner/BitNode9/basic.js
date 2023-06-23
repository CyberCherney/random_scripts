/** @param {NS} ns */
// A basic scanning and script running script
// Contains 3 functions: scan, rooter, runScript
// Makes for ease of importing into other scripts


// scans all servers and returns all non owned servers
export function scan(ns) {
	var ownedServers = ns.getPurchasedServers();
	var allServers = ['n00dles'];
	for (let i = 0; i < allServers.length; i++) {
		var iter = ns.scan(allServers[i]);
		for (let k=0; k < iter.length; k++) {
			if (allServers.indexOf(iter[k]) == -1 && !ownedServers.includes(iter[k]) && iter[k].indexOf('hacknet') == -1) {
				ns.print(iter[k]);
				allServers.push(iter[k]);
			}
		}
	}
	return allServers;
}

// returns all hacknet servers
export function hacknetServers(ns) {
	var homeScan = ns.scan();
	var hacknet = [];
	for (let i=0; i < homeScan.length; i++) {
		if (homeScan[i].indexOf('hacknet') > -1) {hacknet.push(homeScan[i]);}
	}
	return hacknet;
}

// roots a given host if possible
export function rooter(ns, host) {
	var requiredPorts = ns.getServerNumPortsRequired(host);
	var openPort = 0;
	if (ns.fileExists("BruteSSH.exe", "home")) {ns.brutessh(host);	openPort++;}
	if (ns.fileExists("HTTPWorm.exe", "home")) {ns.httpworm(host);	openPort++;}
	if (ns.fileExists("SQLInject.exe", "home")) {ns.sqlinject(host);openPort++;}
	if (ns.fileExists("relaySMTP.exe", "home")) {ns.relaysmtp(host);openPort++;}
	if (ns.fileExists("FTPCrack.exe", "home")) {ns.ftpcrack(host);	openPort++;}
	
	if (openPort >= requiredPorts) {
		ns.nuke(host);
	}
}

// will run a script at 1 thread or max threads depending on input
export function runScript(ns, host, script, threadCount, forceRerun) {
	var scriptCheck = ns.isRunning(script, host, host);
	var isRoot = ns.hasRootAccess(host);
	if (forceRerun && host != 'home') {ns.killall(host)}
	if (!scriptCheck && isRoot) {
		ns.scp(script, host);
		var serverRam = ns.getServerMaxRam(host);
		var scriptRam = ns.getScriptRam(script);
		if (serverRam >= scriptRam) {
			if (threadCount == 'max') {var threads = Math.floor(serverRam/scriptRam);
			} else {threads = 1}
			ns.exec(script, host, threads, host);
		}

	}
}

export async function main(ns) {
//ns.tail();
const hosts = scan(ns);
const hacknets = hacknetServers(ns);
const owned = ns.getPurchasedServers();
for (let i=0; i < hosts.length; i++) {
	var hasRoot = ns.hasRootAccess(hosts[i]);
	if (!hasRoot) {rooter(ns, hosts[i]);}
	runScript(ns, hosts[i], 'ezhack.js', 'max', false);
}

for (let i=0; i < owned.length; i++) {
	runScript(ns, owned[i], 'grow.js', 'max', false);
}

}