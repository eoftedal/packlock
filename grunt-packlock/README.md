Lockdown your modules by specifying a list of approved modules and versions (with semver). Packlock will scan against this list and report modules that are unapproved or at an unapproved version.

Grunt config
------------
Install:

```shell
npm install grunt-retire --save-dev
``` 

Add to your gruntfile:
	
```js
grunt.loadNpmTasks('grunt-packlock');
``` 

Config
------

```js
		packlock: {
			scan: {
				options: {
					whitelist: 'test/packlock.json'
				}
			}
		}
```


Specifying the policy
---------------------
The policy consists of a simple .json file containing modules and versions. Semver is used to check version so you can use [ranges etc. as specified on the semver page](https://www.npmjs.org/doc/misc/semver.html).

    {
        "commander": "^2.2.0",
        "read-installed": "^2.0.3"
    }