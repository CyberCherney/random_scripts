/** @param {NS} ns */
// basic script to initialize text documents and start automator.js
export async function main(ns) {
	await ns.write('ram.txt', '1', 'w');

	if (ns.fileExists('target.txt')) {
			//ns.tail();
			const file = ns.read('target.txt');
			const json = JSON.parse(file);
			var json.host = 'n00dles';
			var target = JSON.stringify(json);
			await ns.write('target.txt', target, 'w');
	} else {
		var target = { 'host': 'n00dles', 'action': 'weaken', 'endHost': 'ecorp' }
		var json = JSON.stringify(json);
		await ns.write('target.txt', json, 'w');
	}

	
	ns.run('automator.js');
}