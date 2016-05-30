# Minimal angular application template
Based on wonderful ngbp (https://github.com/ngbp/ngbp) template by @joshdmiller 

THIS PROJECT SEED IS DEPRECATED! I'm not updating this anymore and if you think starting new project with Angular 1 probably you should reconsider that decicion.

* Includes Bootstrap3 and angular ui-router
* Generic app name to lessen work when using template to start new project.
* Builds non-optimized, compiled and release versions of application
* Supports selecting different profiles to development versions
* Currently deploys only to certain path (e.g. under webapp/ if you like .war's)
* TODO: allow deployment to CDN
* TODO: build gh-pages to show how does it work
***

## Quick Start

Install Node.js and then:
watch
```sh
$ git clone git://github.com/elhigu/angular-sprout
$ cd angular-sprout
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ grunt watch-build
```

Finally, open `http://localhost:3031/index.html` or 
`http://localhost:3031/compiled/index.html` in your browser.

Currently build system creates 3 different builds.

`grunt build` build/debug/index.html (destination directory configured in 
`build.config.js`). `index.html` contains links to each separate javascript file in
project and contains everything in easy debuggable format.

`grunt compile` build/compiled/index.html (destination directory configured in 
`build.config.js`). Compiled build has minimised and compressed javasctipts.

`grunt release` build/release/index.html and build/release/debu/index.html
Release build reads place where backend is found directly from settings
stored in `build.config.js`. Release build contains compiled and debug
versions. This one should go to staging / production environment.

`build.config.js` This file contains info of build directories, where to deploy
release version etc. If you need to add new library, just add it to `bower.json`
and here to include it to build.

`profiles/*.js` These are developer profiles. If you need to use e.g. different beckend
while developing, you can just add your profile here and give `--profile` switch to grunt
to select your active developer profile. This profile will not affect to your `grunt release`
product, so release config is still always read directly from `build.config.js`.

## Purpose

Project template is designed to make life easy by providing a basic structure
and libraries to kickstart AngularJS projects with.

* [Twitter Bootstrap](http://getbootstrap.com)
* UI router [Angular UI](http://angular-ui.github.io)
* Bootstrap components without jQuery [Angular Bootstrap](http://angular-ui.github.io/bootstrap)
* Lodash.js & moment.js
* Awesome [Font Awesome](http://fortawesome.github.com/Font-Awesome)
* Reasonable CSS coding with [LESS](http://lesscss.org)
* Build system [Grunt](http://gruntjs.org)


### Overall Directory Structure

At a high level, the structure looks roughly like this:

```
angular-sprout/
  |- grunt-tasks/
  |- karma/
  |- src/
  |  |- app/
  |  |  |- <app logic>
  |  |- assets/
  |  |  |- <static files>
  |  |- common/
  |  |  |- <reusable code>
  |  |- less/
  |  |  |- main.less
  |- vendor/
  |  |- angular-bootstrap/
  |  |- bootstrap/
  |- .bowerrc
  |- bower.json
  |- build.config.js 
  |- Gruntfile.js
  |- module.prefix
  |- module.suffix
  |- package.json
```

What follows is a brief description of each entry, but most directories contain
their own `README.md` file with additional documentation, so browse around to
learn more.

- `karma/` - test configuration.
- `src/` - our application sources. [Read more &raquo;](src/README.md)
- `vendor/` - third-party libraries. [Bower](http://bower.io) will install
  packages here. Anything added to this directory will need to be manually added
  to `build.config.js` to be picked up by the build system.
- `.bowerrc` - the Bower configuration file. This tells Bower to install
  components into the `vendor/` directory.
- `bower.json` - this is our project configuration for Bower and it contains the
  list of Bower dependencies we need.
- `build.config.js` - our customizable build settings
- `Gruntfile.js` - our build scripts
- `module.prefix` and `module.suffix` - our compiled application script is
  wrapped in these, which by default are used to place the application inside a
  self-executing anonymous function to ensure no clashes with other libraries.
- `package.json` - metadata about the app, used by NPM and our build script. Our
  NPM dependencies are listed here.

## Grunt tasks

You can get usage info for grunt by just running `grunt` without any task. There is also
information about all different deployment options configured in `build.config.js`

```
=======================================#### TASKS ####=========================================
grunt build                        Build debug version of application with selected profile.
grunt compile                      Creates concat / uglified version of code 
                                   under 'compiled/' subpath.
grunt compile-fast                 Like compile, but does not uglify.
grunt test                         Runs the test suite.
grunt watch-build                  Watch changes in all files and rebuild if changes, triggers
                                   livereload after changes.
grunt watch-test                   Watch when build tree is stabilized and run tests after
                                   few seconds. Depends on watch-build being run separately.
grunt --conf=<config> release      Complete clean build and generation of release files.
                                   Available configurations are listed in build.config.js
grunt --conf=<config> release-fast Like release, but does not clean build and does not uglify
                                   produced result javascript.
grunt --conf=<config> deploy       Deploys release code to final destination e.g. Amazon S3
grunt --conf=<config> watch-deploy Watch for changes + trigger release-fast and deploys.
                                   Depends on watch-build being run
==================================== Deploy configurations ====================================
{
  "default": {
    "type": "localdir",
    "path": "example_deploy_dest",
    "appConfig": {
      "backend": "/resource"
    }
  },
  "production": {
    "type": "rackspace",
    "path": "somerackspacething",
    "access": "apitoken",
    "appConfig": {
      "backend": "https://backend.example.org/api/v1"
    }
  },
  "staging": {
    "type": "S3",
    "path": "buckee",
    "access": "apitoken",
    "appConfig": {
      "backend": "https://qa.example.org/api/v1"
    }
  }
}
========================================== GruntTODO ==========================================
* Recognize that if selected profile changes, changes should be emitted to 
  selected-profile.js (maybe selected profile should just require real profile.)
* Add support to multiple release configurations and different configurations e.g. 
  for S3  / Rackspace / Directory / scp / anything?
```

### Express

Serves debug version in `http://localhost:3031` and compiled in `http://localhost:3031/compiled`
Compiled version is not updated automatically with watch.

### i18nextract

Collect all keys to translate.

## FAQ

### You have problem in production, but code is compiled and there are no source maps etc.

By default we include compiled and debug versions of code to release version of app. If 
your app is located in `https://example.org/theapp/index.html` then you can checkout debug 
version in `https://example.org/theapp/debug/index.html`

### Add new library with Bower

Add library to your `bower.json` and add line to `build.config.js` to include it
to application.

### Copy complete directory from vendor path to compiled program

Check how bootstrap fonts are copied there in `build.config.js`.

### Add new style sheet for module

Add `.less` file to `src/app/modulename/somestyle.less`. Add `@import` statement to 
end of `src/less/main.less`.

### Create different backend configuration for local development

Add new profile file to `profiles/yourprofile.js` and run `grunt --profile=yourprofile`
it will create `selected-profile.js` which will be used by default for rest of grunt 
commands.

### Deploy to staging, production, S3, rackspace, anywhere

Currently only deployment to certain directory is supported. 

TODO: add support for multiple deployment profiles (production, staging) and 
      destinations e.g. to rackspace, S3, directory, with debug or not, etc.
      and ask deployment key for first deployment (don't store it to repo).

### Can I use CoffeeScript with this project template?

No.
