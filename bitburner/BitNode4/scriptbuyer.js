/** @param {NS} ns */
export async function main(ns) {
	// might not have access to the function I need
	const scripts = ["BruteSSH.exe", "HTTPWorm.exe", "SQLInject.exe", "relaySMTP.exe", "FTPCrack.exe", 
	"AutoLink.exe", "DeepscanV1.exe", "DeepscanV2.exe"];
	
	if(ns.hasTorRouter()) {
		
		for (let i = 0; i < scripts.length; i++) {
			purchaseDarknetProgram(ns, scripts[i]);
		}

	} else {
		ns.singularity.purchaseTor();
	}
}

export function purchaseDarknetProgram(ns, program) {
	if (!ns.fileExists(program, "home")) {
		ns.singularity.purchaseProgram(program);
	}
}


