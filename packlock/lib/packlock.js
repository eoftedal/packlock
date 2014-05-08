var exports = exports || {};

var path	 		= require('path'),
	semver   		= require('semver'),
	readInstalled 	= require('read-installed');

var arrow = String.fromCharCode(8627);


function printBads(config, module, level) {
	var msg = "! ";
	for (var i = 0; i < level - 1; i++) { msg += "  "; }
	if (level > 0) { msg += arrow + ' '; }
	for (var i in module) {
		if (i !== arrow) {
			if (module[i][arrow]) {
				config.log.warn(msg + i + ' ' + module[i][arrow]);
			} else {
				config.log.warn(msg + i);
			}
			printBads(config, module[i], level + 1);
		}
	} 
}


function setVulnerable(bads, namestack, msg) {
	var b = bads;
	namestack.forEach(function(name) {
		b[name] = b[name] || {};
		b = b[name];
	});
	b[arrow] = msg;
}


function checkDependencyTree(config, whitelist, modules, bads, namestack) {
	for (var module in modules.dependencies) {
		var name = modules.dependencies[module].name + '@' + modules.dependencies[module].version
		namestack.push(name);
		if (!whitelist[module]) {
			setVulnerable(bads, namestack, 'not allowed');
		} else if (!semver.satisfies(modules.dependencies[module].version, whitelist[module])) {
			setVulnerable(bads, namestack, 'is only allowed in version ' + whitelist[module]);
		}
		if (config.recurse) checkDependencyTree(config, whitelist, modules.dependencies[module], bads, namestack);
		namestack.pop();
	}
}


function scan(config, whitelist, callback) {
	config.log.info('Reading modules in ' + path.resolve(config.scanpath))
	readInstalled(config.scanpath, {}, function (er, pkginfo) {
		var bads = {};
		var namestack = [];
		var mainModule = pkginfo.name + '@' + pkginfo.version; 
		namestack.push(mainModule);
		checkDependencyTree(config, whitelist, pkginfo, bads, namestack);
		if (bads[mainModule]) {
			printBads(config, bads, 0);
			return callback(false);
		}
		callback(true);
	});
}

exports.scan = scan;

