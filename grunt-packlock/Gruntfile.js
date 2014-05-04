'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
    	packlock: {
			scan: {
				options: {
					whitelist: 'test/packlock.json'
				}
			},
			fail: {
				options: {
					whitelist: 'test/packlock-fail.json'
				}
			}

		}
	});

   // Actually load this plugin's task(s).
   grunt.loadTasks('tasks');

   // By default, lint and retire.
   grunt.registerTask('default', ['packlock']);

};
