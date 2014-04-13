# Minimal angular application template
Based on wonderful ngbp (https://github.com/ngbp/ngbp) template by @joshdmiller 

* Includes Bootstrap3 and angular ui-router
* Generic app name to lessen work when using template to start new project.
* Builds non-optimized, compiled and release versions of application
* Supports selecting different profiles to development versions
* Currently deploys only to certain path (e.g. under webapp/ if you like .war's)
* TODO: allow deployment to CDN
* TODO: build gh-pages to show how does it work
* TODO: make grunt watch to work better...
***

## Quick Start

Install Node.js and then:

```sh
$ git clone git://github.com/elhigu/angular-sprout
$ cd angular-sprout
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ grunt watch
```

Finally, open `file:///path/to/angular-sprout/build/debug/index.html` in your browser.

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

## Learn

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
  |  |- placeholders/
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
  to `build.config.js` and `karma/karma-unit.js` to be picked up by the build
  system.
- `.bowerrc` - the Bower configuration file. This tells Bower to install
  components into the `vendor/` directory.
- `bower.json` - this is our project configuration for Bower and it contains the
  list of Bower dependencies we need.
- `build.config.js` - our customizable build settings; see "The Build System"
  below.
- `Gruntfile.js` - our build script; see "The Build System" below.
- `module.prefix` and `module.suffix` - our compiled application script is
  wrapped in these, which by default are used to place the application inside a
  self-executing anonymous function to ensure no clashes with other libraries.
- `package.json` - metadata about the app, used by NPM and our build script. Our
  NPM dependencies are listed here.

