/* jshint -W055 */
'use strict';

module.exports = function (grunt) {

   var semver  = require('semver'),
	fs		= require('fs'),
	path	= require('path'),
	readInstalled = require('read-installed');

   grunt.registerMultiTask('packlock', 'Whitelisting node modules and versions', function () {
		var done = this.async();
		var config = this.options({
		    scanpath : '.',
		    whitelist : '.',
		    recurse : false,
		});
		grunt.log.writeln(JSON.stringify(config));
		if (fs.statSync(config.whitelist).isDirectory()) {
			config.whitelist = path.resolve(config.whitelist, 'packlock.json');
		}
		if (!fs.existsSync(config.whitelist)) {
			grunt.log.error('Cannot read ' + config.whitelist);
			return done(false);
		}
		if (!fs.existsSync(config.scanpath)) {
			grunt.log.error('Cannot scan non-existent directory: ' + config.scanpath);
			return done(false);
		}
		if (!fs.statSync(config.scanpath).isDirectory()) {
			grunt.log.error('Scan path should be a directory');
			return done(false);
		}

		grunt.log.writeln('Reading whitelisted modules from ' + config.whitelist)
		fs.readFile(config.whitelist, function(err, data) {
			if (err) {
				grunt.log.error('Cannot read whitelist ' + config.whitelist);
				return done(false)
			} else {
				grunt.event.emit('whitelist-read', JSON.parse(data));
			}
		});

		var success = true;
		var printed = false;

		grunt.event.once('whitelist-read', function(whitelist) {
		        var namestack=[];
		        var bads=[];
                        function checkDependencyTree(modules) {
                          for (var module in modules.dependencies) {
                            namestack.push(module);
                            var tmpStack=namestack.slice();
                            tmpStack.pop();
                            if (!whitelist[module]) {
                              bads.push({crumbs:tmpStack.join(' : '), name:module, version:modules.dependencies[module].version, error:'not allowed'});
                            } else if (!semver.satisfies(modules.dependencies[module].version, whitelist[module])) {
                              bads.push({crumbs:tmpStack.join(' : '), name:module, version:modules.dependencies[module].version, error:'is only allowed in version ' + whitelist[module]});
                            }
                            if (config.recurse) checkDependencyTree(modules.dependencies[module]);
                            namestack.pop();
                          }
                        }

			grunt.log.writeln('Reading modules in ' + path.resolve(config.scanpath))
			readInstalled(config.scanpath, {}, function (er, pkginfo) {
			        namestack.push(pkginfo.name);
				checkDependencyTree(pkginfo);
                                bads.sort(function(a,b){return a.crumbs.localeCompare(b.crumbs);});
                                var previousCrumbs='';
                                for (var i=0; i<bads.length; i++) {
                                    success = false;
                                    if (bads[i].crumbs!=previousCrumbs) {
                                        previousCrumbs=bads[i].crumbs;
                                        grunt.log.warn('Module: ' + bads[i].crumbs);
                                    }
                                    grunt.log.warn(' ' + String.fromCharCode(8627) + ' ' + bads[i].name + ' ' + bads[i].version + ' ' + bads[i].error);
                                }
				grunt.event.emit('done');
			});
		});
		grunt.event.once('done', function() {
			grunt.event.removeAllListeners();
			done(success);
		});
	});
}
 


