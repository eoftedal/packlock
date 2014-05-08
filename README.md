Lockdown your modules by specifying a list of approved modules and versions (with semver). Packlock will scan against this list and report modules that are unapproved or at an unapproved version.



Usage
-----

Install

```shell
npm install -g packlock
```

Usage:
```
packlock [options]

Options:

-h, --help             output usage information
-V, --version          output the version number

-s, --scanpath [path]  Directory to scan for packages. Defaults to current directory
-w, --whitelist [path] Location of whitelist. Defaults to current directory
-r, --recurse          Scan transitive dependencies
```

Example:

```shell
packlock -w /our/global/policy.json -s /usr/local/nodeapp/
```

Specifying the policy
---------------------
The policy consists of a simple .json file containing modules and versions. Semver is used to check version so you can use [ranges etc. as specified on the semver page](https://www.npmjs.org/doc/misc/semver.html).

```js
{
    "commander": "^2.2.0",
    "read-installed": "^2.0.3"
}
```

