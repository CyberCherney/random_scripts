/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	var hosts = crawler(ns);
	var rooted = isRooted(hosts, ns);
	decision(rooted, ns);
}

// gets a list of all hosts
function crawler(ns) {
	var allhosts = ns.scan();
	var unique = allhosts;
	for (let i = 0; i < unique.length; i++) {
		var iter = ns.scan(unique[i]);
		for (let k = 0; k < iter.length; k++) {
			if (allhosts.indexOf(iter[k]) == -1) {
				allhosts.push(iter[k]);
			}
		}
	}
	unique = allhosts.filter(function (elem, index, self) {
		return index === self.indexOf(elem);
	})
	return unique;
}

// checks if the hosts have been rooted
// rooted hosts are placed in a new array
function isRooted(hosts, ns) {
	var rooted = []
	for (let i = 0; i < hosts.length; i++) {
		var check = ns.hasRootAccess(hosts[i]);
		if (check == true) {
			rooted.push(hosts[i]);
		}
	}
	ns.print(rooted);
	return rooted;
}


// makes the decision of which host is to be targetted and to hack or weaken
// my bought servers are handling the growth spam for the time being
function decision(rooted, ns) {
	
	// this part will find the server with the highest money available
	// after finding it the server is crowned topDog
	var topDog = '';
	var dollars = 0;
	for (let i = 0; i < rooted.length; i++) {
		var cash = ns.getServerMoneyAvailable(rooted[i]);
		if (cash > dollars && rooted[i] != 'home') {
			dollars = cash;
			topDog = rooted[i];
		}
	}
	ns.print('Top dog is ' + topDog);

	// checks an arbitrary percentage threshhold I set of .75
	// likely will change this in the future after some math
	var max = Number(ns.getServerBaseSecurityLevel(topDog));
	var min = Number(ns.getServerMinSecurityLevel(topDog));
	var current = Number(ns.getServerSecurityLevel(topDog));
	var threshhold = Number((current - min) / (max - min));

	var maxDollars = Number(ns.getServerMaxMoney(topDog));
	var percentFull = maxDollars / dollars;
	ns.print(threshhold);
	if (threshhold > .75) {
		var action = 'weaken';
	} else if (percentFull < .4) {
		var action = 'grow';
	} else {
		var action = 'hack';
	}
	
	// writes then transfers the action and hosts to all rooted hosts
	ns.write('action.txt', action, 'w');
	ns.write('host.txt', topDog, 'w');

	for (let i = 0; i < rooted.length; i++) {
		ns.scp('action.txt', rooted[i]);
		ns.scp('host.txt', rooted[i]);
	}
}