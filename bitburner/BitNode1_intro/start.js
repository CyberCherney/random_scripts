/** @param {NS} ns */
// basic script to initialize text documents and start automator.js
export async function main(ns) {


	//ns.tail();
	if (ns.fileExists('target.txt')) {
			
			const file = ns.read('target.txt');
			const json = JSON.parse(file);
			json.host = 'n00dles';
			json.ramPower = '1';
			var target = JSON.stringify(json);
			await ns.write('target.txt', target, 'w');
	} else {
		var target = {}
		target.host = 'n00dles';
		target.action = 'weaken'; 
		target.endHost = 'ecorp';
		target.ramPower = '1';
		ns.print(target);
		var fileOut = JSON.stringify(target);
		ns.print(fileOut);
		await ns.write('target.txt', fileOut, 'w');
	}

	
	await ns.run('automator.js');

	//ns.run('sleeve.js');

}