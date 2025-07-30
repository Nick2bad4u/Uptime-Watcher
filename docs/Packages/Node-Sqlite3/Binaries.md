Please see the section about [Installing](https://github.com/TryGhost/node-sqlite3#prebuilt-binaries) in the README to get a grasp of how `node-sqlite3` binaries work.

### Help

If you've landed here due to a failed install of `node-sqlite3` then feel free to create a [new issue](https://github.com/tryghost/node-sqlite3/issues/new) to ask for help.

The most likely problem is that we do not yet provide prebuilt binaries for your particular platform and so the `node-sqlite3` install attempted a source compile but failed because you are missing the [dependencies for node-gyp](https://github.com/TooTallNate/node-gyp#installation).

Please provide as much detail on your problem as possible and we'll try to help. Please include:

- Terminal logs of failed install (best from running `npm install sqlite3 --loglevel=info`)
- `node-sqlite3` version you tried to install
- Node version you are running
- Operating system and architecture you are running, e.g. `Windows 7 64 bit`.

### Forcing a source compile

To force building from source do:

``` bash
npm install sqlite3 --build-from-source=sqlite3
```

or, if you are installing an app that depends on \`sqlite3:

``` bash
npm install --build-from-source=sqlite3
```

### Installing an alternative arch

To request an (additional) `arch` be installed that is different from the value of `process.arch` for your running node version you can pass `--target_arch`. For example, to install a 32bit binary on the 64 bit system do:

``` sh
npm install sqlite3 --target_arch=ia32
```
