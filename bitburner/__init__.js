/** @param {NS} ns */


export async function jsonRead(ns) {
    const file = ns.read('vars.txt')
    const json = JSON.parse(file)
    return json
}

export async function jsonWrite(ns, json) {
    try {
        const fileOut = JSON.stringify(json)
        ns.write('vars.txt', fileOut, 'w')
    } catch(e) {
        ns.tail()
        print('Error in writing json')
    }
}


var vars = {}


