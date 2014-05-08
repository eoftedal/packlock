/* jshint -W055 */
'use strict';

module.exports = function (grunt) {
	
   var  fs		 = require('fs'),
   		packlock = require('packlock/lib/packlock'),
		path	 = require('path');


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

		config.log = {info: grunt.log.writeln, warn: grunt.log.warn };

		fs.readFile(config.whitelist, function(err, data) {
			if (err) {
				grunt.log.error('Cannot read whitelist ' + config.whitelist);
				return done(false)
			} else {
				var whitelist = JSON.parse(data);
				packlock.scan(config, whitelist, done);
			}
		});
	});
}
 


