/** @param {NS} ns */

/**
 * JOINING BLADEBURNERS
 * 
 * inBladeburner() 	
 * joinBladeburnerDivision() 
 * joinBladeburnerFaction()
 * 
 * 
 * CITY ENUM
 * 
 * switchCity(city)
 * getCity()
 * getCityChaos(city)
 * getCityCommunities(city) 
 * getCityEstimatedPopulation(city)
 * 
 * 
 * ACTIONS
 * 
 * startAction(type, name)
 * stopBladeburnerAction()
 * getContractNames()
 * getCurrentAction()
 * getGeneralActionNames()
 * getActionCountRemaining(type, name)
 * getActionCurrentLevel(type, name)
 * getActionCurrentTime() 	Get the time elapsed on current action.
 * getActionEstimatedSuccessChance(type, name)
 * getActionMaxLevel(type, name)
 * getActionRepGain(type, name, level)
 * getActionSuccesses(type, name)
 * getActionTime(type, name)
 * 
 * 
 * SKILLS/STATS
 * 
 * getStamina()
 * upgradeSkill(name, count)
 * getSkillLevel(name)
 * getSkillNames()
 * getSkillPoints()
 * getSkillUpgradeCost(name, count)
 * getRank()
 * 
 * 
 * TEAMS
 * 
 * setTeamSize(type, name, size)
 * getTeamSize()
 * 
 * 
 * OPERATIONS
 * 
 * getOperationNames()
 * 
 * 
 * BlackOPS
 * 
 * getBlackOpNames()
 * getBlackOpRank(name)
 * 
 * 
 * MISC
 * 
 * getBonusTime()
 * 
 * 
 */
export async function main(ns) {
	
	ns.tail();


	//var info = ns.getPlayer();
	//ns.print(info);

	await bladeburnerSkillBuy(ns, 'auto');


}



export function bladeburnerSkillBuy(ns, purchaseCategory) {
	// Auto buys based on the desired category
	// Upgrades are grouped into Contract, Operations, BlackOps, Income, SkillUp, Speed, Stamina
	// Sets variables to true then runs through all buy options

	var Contracts = false;
	var Operations =  false;
	var BlackOps = false;
	var Income = false;
	var Speed = false;
	var Stamina = false;

	if (typeof purchaseCategory == 'undefined') {
		ns.print("Please enter a category.");
		ns.print("The categories are Contract, Operations, BlackOps, Income, SkillUp, Speed, Stamina.");
		ns.print("For auto buying please enter 'auto'");
		ns.kill('bladeburner.js');
	}

	if (purchaseCategory == 'Contracts') {
		Contracts = true;
	} else if (purchaseCategory == 'Operations') {
		Operations = true;
	} else if (purchaseCategory == 'BlackOps') {
		BlackOps = true;
	} else if (purchaseCategory == 'Income') {
		Income = true;
	} else if (purchaseCategory == 'SkillUp') {
		SkillUp = true;
	} else if (purchaseCategory == 'Speed') {
		Speed = true;
	} else if (purchaseCategory == 'Stamina') {
		Stamina = true;
	} else if (purchaseCategory == 'auto') {
		Contracts = true;
		Income = true;
	}

	if (Contracts || Operations || BlackOps) {
		ns.bladeburner.upgradeSkill("Blade's Intuition");
	}

	if (Contracts || Operations || BlackOps) {
		ns.bladeburner.upgradeSkill("Cloak");
	}

	if (Contracts || Operations || BlackOps) {
		ns.bladeburner.upgradeSkill("Short-Circuit");
	}

	if (Operations || BlackOps) {
		ns.bladeburner.upgradeSkill("Digital Observer");
	}

	if (Contracts) {
		ns.bladeburner.upgradeSkill("Tracer");
	}

	if (Contracts || Operations || BlackOps || Speed) {
		ns.bladeburner.upgradeSkill("Overclock");
	}

	if (Contracts || Operations || BlackOps) {
		ns.bladeburner.upgradeSkill("Reaper");
	}

	if (Contracts || Operations || BlackOps) {
		ns.bladeburner.upgradeSkill("Evasive System");
	}

	if (SkillUp) {
		ns.bladeburner.upgradeSkill("Datamancer");
	}

	if (Stamina) {
		ns.bladeburner.upgradeSkill("Cyber's Edge");
	}	

	if (Income) {
		ns.bladeburner.upgradeSkill("Hands of Midas");
	}
	
	if (SkillUp) {
		ns.bladeburner.upgradeSkill("Hyperdrive");
	}

}
