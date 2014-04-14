module.exports = function ( grunt ) {

  /**
   * Load required Grunt tasks. These are installed based on the versions listed
   * in `package.json` when you do `npm install` in this directory.
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-karma'); 
  grunt.loadNpmTasks('grunt-html2js');

  var path = require('path');

  /**
   * Load in our build configuration file.
   *
   * Provides <%= bc.* %> variables.
   */
  var userConfig = require( './build.config.js' );

  /** 
   * Read profile variables from separate file
   * 
   * 1. if profile switch is given, copy profile to selected-profile.js
   * 2. if selected profile does not exist tell user to select one
   * 3. load profile with require
   */
  var profile = grunt.option('profile');
  if (profile) {
    var profile_path = path.join('profiles', profile) + ".js";
    grunt.log.ok("Copying profile file", profile_path, "to ./selected_profile.js");
    grunt.file.copy(profile_path, './selected-profile.js');
  }

  var selectedProfile = null;
  try {
    selectedProfile = require('./selected-profile.js');
  } catch (e) {
    grunt.fail.warn("Developer profile not selected. Select active profile by running\n\ngrunt --profile=dev-mikael\n\n");
  }

  grunt.util._.extend(userConfig, selectedProfile);

  /**
   * This is the configuration object Grunt uses to give each plugin its
   * instructions.
   */
  var taskConfig = {
    /**
     * Provides all <%= pkg.* %> variables.
     */
    pkg: grunt.file.readJSON("package.json"),

    css_path: 'assets/<%= pkg.name %>-<%= pkg.version %>.css',

    /**
     * The banner is the comment that is placed at the top of our compiled
     * source files. It is first processed as a Grunt template, where the `<%=`
     * pairs are evaluated based on this very configuration object.
     */
    meta: {
      banner:
        '/**\n' +
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' */\n'
    },

    /**
     * The directories to delete when `grunt clean` is executed.
     */
    clean: [
      '<%= bc.build_dir %>',
      '<%= bc.compile_dir %>',
      '<%= bc.release_dir %>'
    ],

    /**
     * The `copy` task just copies files from A to B. We use it here to copy
     * our project assets (images, fonts, etc.) and javascripts into
     * `build_dir`, and then to copy the assets to `compile_dir`.
     */
    copy: {
      build_app_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= bc.build_dir %>/assets/',
            cwd: 'src/assets',
            expand: true
          }
       ]
      },
      vendor_assets: {
        files: [
          {
            src: [ '<%= bc.vendor_files.assets %>' ],
            dest: '<%= bc.build_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          },
          {
            src: [ '<%= bc.vendor_files.assets %>' ],
            dest: '<%= bc.compile_dir %>/assets/',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      build_vendor_directories: {
        files: grunt.util._.map(userConfig.bc.vendor_files.dirs, function (directory) {
          var files_entry = {
            src: ['**'],
            dest: path.join(userConfig.bc.build_dir, directory.dst_path),
            cwd: directory.src_path,
            expand: true
          };
          console.log("Directory copy entry:", files_entry);
          return files_entry;
        })
      },
      compile_vendor_directories: {
        files: grunt.util._.map(userConfig.bc.vendor_files.dirs, function (directory) {
          var files_entry = {
            src: ['**'],
            dest: path.join(userConfig.bc.compile_dir, directory.dst_path),
            cwd: directory.src_path,
            expand: true
          };
          console.log("Directory copy entry:", files_entry);
          return files_entry;
        })
      },
      build_appjs: {
        files: [
          {
            src: [ '<%= bc.app_files.js %>' ],
            dest: '<%= bc.build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      build_vendorjs: {
        files: [
          {
            src: [ '<%= bc.vendor_files.js %>' ],
            dest: '<%= bc.build_dir %>/',
            cwd: '.',
            expand: true
          }
        ]
      },
      create_release: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= bc.release_dir %>/debug/',
            cwd: '<%= bc.build_dir %>',
            expand: true
          },
          {
            src: [ '**' ],
            dest: '<%= bc.release_dir %>/',
            cwd: '<%= bc.compile_dir %>',
            expand: true
          }

        ]
      },
      deploy: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= bc.deploy_dir %>/',
            cwd: '<%= bc.release_dir %>',
            expand: true
          }
        ]
      }
    },

    /**
     * `grunt concat` concatenates multiple source files into a single file.
     */
    concat: {
      /**
       * The `compile_js` target is the concatenation of our application source
       * code and all specified vendor source code into a single file.
       */
      compile_js: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: [
          '<%= bc.vendor_files.js %>',
          'module.prefix',
          '<%= bc.build_dir %>/src/**/*.js',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          'module.suffix'
        ],
        dest: '<%= bc.compile_dir %>/assets/<%= pkg.name %>-<%= pkg.version %>.js'
      }

    },

    /**
     * Minify the sources
     */
    uglify: {
      compile: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>'
        }
      }
    },

    /**
     * Compiles and compress less to css
     */
    less: {

      build: {
        options: {
          sourceMap: true,
          outputSourceFiles: true
        },
        files: {
          '<%= bc.build_dir %>/<%= css_path %>': 'src/less/main.less'
        }
      },

      compile: {
        options: {
          cleancss: true,
          report: 'min'
        },
        files: {
          '<%= bc.compile_dir %>/<%= css_path %>': 'src/less/main.less'
        }
      }
    },

    /**
     * `jshint` defines the rules of our linter as well as which files we
     * should check. This file, all javascript sources, and all our unit tests
     * are linted based on the policies listed in `options`. But we can also
     * specify exclusionary patterns by prefixing them with an exclamation
     * point (!); this is useful when code comes from a third party but is
     * nonetheless inside `src/`.
     */
    jshint: {
      src: [
        '<%= bc.app_files.js %>'
      ],
      test: [
        '<%= bc.app_files.jsunit %>'
      ],
      gruntfile: [
        'Gruntfile.js'
      ],
      options: {
        curly: true,
        immed: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ '<%= bc.app_files.atpl %>' ],
        dest: '<%= bc.build_dir %>/templates-app.js'
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ '<%= bc.app_files.ctpl %>' ],
        dest: '<%= bc.build_dir %>/templates-common.js'
      }
    },

    /**
     * The Karma configurations.
     */
    karma: {
      options: {
        configFile: '<%= bc.build_dir %>/karma-unit.js'
      },
      unit: {
        runnerPort: 9101,
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    /**
     * The `index` task compiles the `index.html` file as a Grunt template. CSS
     * and JS files co-exist here but they get split apart later.
     */
    index: {

      /**
       * During development, we don't want to have wait for compilation,
       * concatenation, minification, etc. So to avoid these steps, we simply
       * add all script files directly to the `<head>` of `index.html`. The
       * `src` property contains the list of included files.
       */
      build: {
        dir: '<%= bc.build_dir %>',
        src: [
          '<%= bc.vendor_files.js %>',
          '<%= bc.build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= bc.vendor_files.css %>'
        ],
        selectedBackend: '<%= dev.backend %>'
      },

      compile: {
        dir: '<%= bc.compile_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= bc.vendor_files.css %>'
        ],
        selectedBackend:  '<%= dev.backend %>'
      },

      release_build: {
        dir: '<%= bc.release_dir %>/debug',
        src: [
          '<%= bc.vendor_files.js %>',
          '<%= bc.build_dir %>/src/**/*.js',
          '<%= html2js.common.dest %>',
          '<%= html2js.app.dest %>',
          '<%= bc.vendor_files.css %>'
        ],
        selectedBackend: '<%= bc.deploy_backend %>'
      },

      release_compile: {
        dir: '<%= bc.release_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= bc.vendor_files.css %>'
        ],
        selectedBackend: '<%= bc.deploy_backend %>'
      }

    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      unit: {
        dir: '<%= bc.build_dir %>',
        src: [
          '<%= bc.vendor_files.js %>',
          '<%= html2js.app.dest %>',
          '<%= html2js.common.dest %>',
          '<%= bc.test_files.js %>'
        ]
      }
    },

    /**
     * And for rapid development, we have a watch set up that checks to see if
     * any of the files listed below change, and then to execute the listed
     * tasks when they do. This just saves us from having to type "grunt" into
     * the command-line every time we want to see what we're working on; we can
     * instead just leave "grunt watch" running in a background terminal. Set it
     * and forget it, as Ron Popeil used to tell us.
     *
     * But we don't need the same thing to happen for all the files.
     *
     * TODO: different watches... 
     *       watch build, 
     *       watch compile, 
     *       watch release, 
     *       watch deploy
     * 
     * TODO: Fix if index.html / build.config.js / selected-profile.js /
     *       profile is changed it should be recognized.
     */
    delta: {
      /**
       * By default, we want the Live Reload to work for all tasks; this is
       * overridden in some tasks (like this file) where browser resources are
       * unaffected. It runs by default on port 35729, which your browser
       * plugin should auto-detect.
       */
      options: {
        livereload: true
      },

      /**
       * When the Gruntfile changes, we just want to lint it. In fact, when
       * your Gruntfile changes, it will automatically be reloaded!
       */
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: [ 'jshint:gruntfile' ],
        options: {
          livereload: false
        }
      },

      /**
       * When our JavaScript source files change, we want to run lint them and
       * run our unit tests.
       */
      jssrc: {
        files: [
          '<%= bc.app_files.js %>'
        ],
        tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_appjs', 'index:build' ]
      },

      /**
       * When assets are changed, copy them. Note that this will *not* copy new
       * files, so this is probably not very useful.
       */
      assets: {
        files: [
          'src/assets/**/*'
        ],
        tasks: [ 'copy:build_assets' ]
      },

      /**
       * When index.html changes, we need to compile it.
       */
      html: {
        files: [ '<%= bc.app_files.html %>' ],
        tasks: [ 'index:build' ]
      },

      /**
       * When our templates change, we only rewrite the template cache.
       */
      tpls: {
        files: [
          '<%= bc.app_files.atpl %>',
          '<%= bc.app_files.ctpl %>'
        ],
        tasks: [ 'html2js' ]
      },

      /**
       * When the CSS files change, we need to compile and minify them.
       */
      less: {
        files: [ 'src/**/*.less' ],
        tasks: [ 'less' ]
      },

      /**
       * When a JavaScript unit test file changes, we only want to lint it and
       * run the unit tests. We don't want to do any live reloading.
       */
      jsunit: {
        files: [
          '<%= bc.app_files.jsunit %>'
        ],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  /**
   * In order to make it safe to just compile or copy *only* what was changed,
   * we need to ensure we are starting from a clean, fresh build. So we rename
   * the `watch` task to `delta` (that's why the configuration var above is
   * `delta`) and then add a new task called `watch` that does a clean build
   * before watching for changes.
   */
  grunt.renameTask( 'watch', 'delta' );
  grunt.registerTask( 'watch', [ 'build', 'karma:unit', 'delta' ] );

  /**
   * The default task is to build and compile.
   */
  grunt.registerTask( 'default', [ 'compile' ] );

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask( 'build', [
    'clean', 'html2js', 'jshint', 'less:build', 'copy:build_app_assets', 'copy:vendor_assets', 
    'copy:build_vendor_directories', 'copy:compile_vendor_directories',
    'copy:build_appjs', 'copy:build_vendorjs', 'index:build', 'karmaconfig', 'karma:continuous'
  ]);

  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code to release directory.
   */
  grunt.registerTask( 'compile', [
    'build', 'less:compile', 'concat:compile_js', 'uglify:compile', 'index:compile'
  ]);

  grunt.registerTask( 'release', [
    'compile', 'copy:create_release', 'index:release_build', 'index:release_compile'
  ]);

  /**
   * Deploy to final production / staging server.
   * 
   * 1. Clean build.
   * 2. Copy application to release directory and fix configuration.
   * 3. Compile / minify release.
   * 4. Copy deploy directory to final location in .war.
   */
  grunt.registerTask( 'deploy', [ 'release', 'copy:deploy']);

  /**
   * A utility function to get all app JavaScript sources.
   */
  function filterForJS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.js$/ );
    });
  }

  /**
   * A utility function to get all app CSS sources.
   */
  function filterForCSS ( files ) {
    return files.filter( function ( file ) {
      return file.match( /\.css$/ );
    });
  }

  /**
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   *
   * NOTE: Fix this... this is pretty ugly way to do it and error prone.
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {

    function escapeRegExp(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    var dirRE = new RegExp( '^('+
      escapeRegExp(grunt.config('bc.build_dir'))+'|'+
      escapeRegExp(grunt.config('bc.compile_dir'))+'|'+
      escapeRegExp(grunt.config('bc.release_dir'))+')\/', 'g' );

    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });

    // jswtf # 32583: how to do push front with javascript.
    cssFiles.unshift(grunt.config('css_path'));
    selectedBackend = this.data.selectedBackend;
    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            backend: selectedBackend
          }
        });
      }
    });
  });

  /**
   * In order to avoid having to specify manually the files needed for karma to
   * run, we use grunt to manage the list for us. The `karma/*` files are
   * compiled as grunt templates for use by Karma. Yay!
   */
  grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
    var jsFiles = filterForJS( this.filesSrc );

    // get realtive path to here for karma configuration template
    var dest_dir = grunt.config( 'bc.build_dir' );
    var relative_path = path.relative(dest_dir, '.');

    grunt.file.copy( 'karma/karma-unit.tpl.js', dest_dir + '/karma-unit.js', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            base_dir: relative_path
          }
        });
      }
    });
  });

};
