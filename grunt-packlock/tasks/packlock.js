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
		    whitelist : '.'
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
		grunt.event.on('bad-found', function(pkginfo, name, error) {
			success = false;
			if (!printed) {
				grunt.log.warn('Module: ' + pkginfo.name + ' ' + pkginfo.version);
				printed = true;
			}
			grunt.log.warn(' ' + String.fromCharCode(8627) + ' ' + name + ' ' + pkginfo.dependencies[name].version + ' ' + error);
		});


		grunt.event.once('whitelist-read', function(whitelist) {
			grunt.log.writeln('Reading modules in ' + path.resolve(config.scanpath))
			readInstalled(config.scanpath, {}, function (er, pkginfo) {
				for (var i in pkginfo.dependencies) {
					if (!whitelist[i]) {
						grunt.event.emit('bad-found', pkginfo, i, 'not allowed');
						continue;
					}
					if (!semver.satisfies(pkginfo.dependencies[i].version, whitelist[i])) {
						grunt.event.emit('bad-found', pkginfo, i, 'is only allowed in version ' + whitelist[i]);
					}
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
 


