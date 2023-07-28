/** @param {NS} ns */
// basic script to initialize text documents and start automator.js
export async function main(ns) {

	if (ns.fileExists('target.txt')) {
			//ns.tail();
			const file = ns.read('target.txt');
			const json = JSON.parse(file);
			json.host = 'n00dles';
			json.serverRam = '1';
			var target = JSON.stringify(json);
			await ns.write('target.txt', target, 'w');
	} else {
		var target = {}
		target.host = 'n00dles';
		target.action = 'weaken'; 
		target.endHost = 'ecorp';
		target.serverRam = '1';
		var json = JSON.stringify(json);
		await ns.write('target.txt', json, 'w');
	}

	
	await ns.run('automator.js');

	ns.run('sleeve.js');

}