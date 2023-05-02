/** 
 * this script is effectively an 'easy afk hack everything' script
 * no doubt it needs improvement to minmax but I'm not sure how far bitburner goes
 * in short I have a hacking script named 'ezhack.js' which is placed on machines crawler.js roots
 * then it is run with the max amount of threads and fed two files: action.txt and host.txt
 * action determines if it will hack or weaken, host determines the target
 * commandcenter.js controls what is in those files and placing them on rooted machines
*/

/** @param {NS} ns */
export async function main(ns) {
	while (true) {
		await ns.asleep(50000);
		await ns.run('crawler.js');
		await ns.run('commandcenter.js');
}
}