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
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-angular-translate');

  var path = require('path');

  var deployConfig = grunt.option('conf') || 'default';
  console.log("Using deployment config: ", deployConfig);

  /**
   * Load in our build configuration file.
   *
   * Provides <%= bc.* %> variables.
   */
  var userConfig = require( './build.config.js' );

  var usageInfo = [
    "=======================================#### TASKS ####=========================================".cyan,
    "grunt build                        ".yellow + "Build debug version of application with selected profile.",
    "grunt compile                      ".yellow + "Creates concat / uglified version of code ",
    "                                   ".yellow + "under 'compiled/' subpath.",
    "grunt compile-fast                 ".yellow + "Like compile, but does not uglify.",
    "grunt test                         ".yellow + "Runs the test suite.",
    "grunt watch-build                  ".yellow + "Watch changes in all files and rebuild if changes, triggers",
    "                                   ".yellow + "livereload after changes.",
    "grunt watch-test                   ".yellow + "Watch when build tree is stabilized and run tests after",
    "                                   ".yellow + "few seconds. Depends on watch-build being run separately.",
    "grunt --conf=<config> release      ".yellow + "Complete clean build and generation of release files.",
    "                                   ".yellow + "Available configurations are listed in build.config.js",
    "grunt --conf=<config> release-fast ".yellow + "Like release, but does not clean build and does not uglify",
    "                                   ".yellow + "produced result javascript.",
    "grunt --conf=<config> deploy       ".yellow + "Deploys release code to final destination e.g. Amazon S3",
    "grunt --conf=<config> watch-deploy ".yellow + "Watch for changes + trigger release-fast and deploys.",
    "                                   ".yellow + "Depends on watch-build being run",
    "==================================== Deploy configurations ====================================".cyan,
    JSON.stringify(userConfig.bc.releaseConfigurations, null, 2).green,
    "========================================== GruntTODO ==========================================".cyan,
    "* Recognize that if selected profile changes, changes should be emitted to ".yellow,
    "  selected-profile.js (maybe selected profile should just require real profile.)".yellow,
    "* Add support to multiple release configurations and different configurations e.g. ".green,
    "  for S3  / Rackspace / Directory / scp / anything?".green,
  ];

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
    clean: {
      build: [
        '<%= bc.build_dir %>'
      ],
      compile: [
        '<%= bc.compile_dir %>'
      ],
      release: [
        '<%= bc.release_dir %>'
      ]
    },

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
      compile_app_assets: {
        files: [
          {
            src: [ '**' ],
            dest: '<%= bc.compile_dir %>/assets/',
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
      build_vendorcss: {
        files: [
          {
            cwd: '.',
            src: [ '<%= bc.vendor_files.css %>' ],
            dest: '<%= bc.build_dir %>/',
            expand: true
          }
        ]
      },
      compile_vendorcss: {
        files: [
          {
            cwd: '.',
            src: [ '<%= bc.vendor_files.css %>' ],
            dest: '<%= bc.compile_dir %>/',
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
            dest: '<%= bc.releaseConfigurations["' + deployConfig + '"].path %>/',
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
      runnerDaemon: {
        runnerPort: 9101,
        background: true
      },
      singleRun: {
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
        selectedAppConfiguration: '<%= dev.appConfiguration %>'
      },

      compile: {
        dir: '<%= bc.compile_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= bc.vendor_files.css %>'
        ],
        selectedAppConfiguration:  '<%= dev.appConfiguration %>'
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
        selectedAppConfiguration: '<%= bc.releaseConfigurations["' + deployConfig + '"].appConfig %>'
      },

      release_compile: {
        dir: '<%= bc.release_dir %>',
        src: [
          '<%= concat.compile_js.dest %>',
          '<%= bc.vendor_files.css %>'
        ],
        selectedAppConfiguration: '<%= bc.releaseConfigurations["' + deployConfig + '"].appConfig %>'
      }

    },

    express: {
      server: {
        options: {
          port: 3031,
          bases: ['build/debug', 'build'],
          livereload: true
/* TODO: Fix this...          ,
          middleware: function (connect) {
            console.log("Serving debug version in http://localhost:3031 and compiled in http://localhost:3031/compiled");
          }
*/
        }
      }
    },

    /**
     * This task compiles the karma template so that changes to its file array
     * don't have to be managed manually.
     */
    karmaconfig: {
      createConfig: {
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
     * Watches:
     *
     * watch-test   When build has triggered and wrote files under build/debug then wait for
     *              debounce delay and after that run jshint and testsuite.
     *
     * watch-build  When sources change rebuild system or needed parts... for now the whole
     *              source is rebuilt.
     *
     * watch-deploy When build is changed also trigger release-tasks and deploy.
     *
     */
    delta: {

      build: {
        files: [
          '<%= bc.app_files.js %>',
          '<%= bc.app_files.html %>',
          '<%= bc.app_files.atpl %>',
          '<%= bc.app_files.ctpl %>',
          '<%= bc.app_files.jsunit %>',
          'src/**/*.less'
        ],
        tasks: [ 'compile-fast' ],
        options: {
          livereload: true,
          interrupt: false
        }
      },

      // just check index.html since it is always generated and removed
      // at start of build this way starting new build interrupts old
      // task if build cycle is started during tests.
      test: {
        files:  [
          '<%= bc.build_dir %>/index.html'
        ],
        tasks: ['jshint', 'karmaconfig', 'karma:runnerDaemon:run'],
        options: {
          livereload: false,
          debounceDelay: 5000,
          interrupt: false // this will break karma runner daemon if true
        }
      },

      deploy: {
        files: [ '<%= bc.compile_dir %>/index.html' ],
        tasks: [ 'clean:release', 'release-tasks', 'deploy' ],
        options: {
          interrupt: false
        }
      }
    },

    /**
     * i18nextract build json lang files
     */
    i18nextract: {
      default_options: {
        src:         [ '<%= bc.app_files.atpl %>', '<%= bc.app_files.ctpl %>', '<%= bc.app_files.js %>' ],
        lang:        ['en', 'fi'],
        jsonSrc:     'src/assets/i18n/*.json',
        dest:        'src/assets/i18n',
        defaultLang: 'en',
        nullEmpty:   true, /* null should provide english translation */
        safeMode:    true
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

  grunt.registerTask( 'watch-build', [
    'compile-fast',               // build & compile
    'express', 'delta:build' ] ); // start serving built app and watch for changes

  grunt.registerTask( 'watch-test', [
    'karma:runnerDaemon', // start karma test runner to port 9018
    'delta:test'
  ] );

  grunt.registerTask( 'watch-deploy', [ 'delta:deploy' ] );

  /**
   * The default task is to print usage information
   */
  grunt.registerTask( 'default', 'Print usage information.', function(arg1, arg2) {
    grunt.log.writeln(usageInfo.join('\n'));
  });

  grunt.registerTask( 'test', 'Clean build and run tests.', [
    'build', 'run-tests' ]);

  grunt.registerTask( 'run-tests', 'Run tests without re-building.', [
    'karmaconfig', 'karma:singleRun' ]);

  grunt.registerTask( 'build', 'Clean old build files and build.',
    [ 'clean:build', 'build-tasks' ]);

  /**
   * The `build` task gets your app ready to run for development and testing.
   */
  grunt.registerTask( 'build-tasks', [
    'html2js',
    'jshint',
    'less:build',
    'copy:build_app_assets',
    'copy:vendor_assets',
    'copy:build_vendor_directories',
    'copy:compile_vendor_directories',
    'copy:build_appjs',
    'copy:build_vendorjs',
    'copy:build_vendorcss',
    'index:build'
  ]);

  grunt.registerTask( 'compile', [
    'build', 'clean:compile', 'compile-tasks'
  ]);

  grunt.registerTask( 'compile-fast', [
    'build', 'clean:compile', 'compile-tasks-fast'
  ]);

  grunt.registerTask( 'compile-tasks', [
    'compile-tasks-fast', 'uglify:compile'
  ]);

  /**
   * The `compile` task gets your app ready for deployment by concatenating and
   * minifying your code to release directory.
   */
  grunt.registerTask( 'compile-tasks-fast', [
    'copy:compile_app_assets',
    'copy:vendor_assets',
    'copy:compile_vendorcss',
    'copy:compile_vendor_directories',
    'less:compile',
    'concat:compile_js',
    'index:compile'
  ]);

  grunt.registerTask( 'release-tasks', [
    'copy:create_release', 'index:release_build', 'index:release_compile'
  ]);

  grunt.registerTask( 'release', [ 'compile', 'clean:release', 'release-tasks' ] );

  grunt.registerTask( 'release-fast', [
    'compile-fast', 'clean:release', 'release-tasks'
  ]);

  /**
   * Deploy to final production / staging server.
   *
   * 1. Clean build.
   * 2. Copy application to release directory and fix configuration.
   * 3. Compile / minify release.
   * 4. Copy deploy directory to final location in .war.
   */
  grunt.registerTask( 'deploy', [ 'release', 'deploy-by-type']);

  // http://stackoverflow.com/questions/15284556/how-can-i-run-a-grunt-task-from-within-a-grunt-task
  grunt.registerTask( 'deploy-by-type', function () {
    var deployConf = userConfig.bc.releaseConfigurations[deployConfig];

    if (deployConf.type == 'localdir') {
      grunt.task.run('copy:deploy');
    } else {
      grunt.fail.fatal("Deploy type " + deployConf.type + " not implemented.");
    }
  });

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
   */
  grunt.registerMultiTask( 'index', 'Process index.html template', function () {

    var buildDir = grunt.config('bc.build_dir') + "/";
    var compileDir = grunt.config('bc.compile_dir') + "/";
    var releaseDir = grunt.config('bc.release_dir') + "/";

    var removePrefixRegex = new RegExp(
        "^(" + buildDir + "|" + compileDir + "|" + releaseDir + ")");

    function normalizePath(path) {
      // convert path to unix / webformat and strip build/compile/release
      // dir prefixes to get relative paths right in index.html
      var unixPath = path.split(path.sep).join("/");
      unixPath = unixPath.replace(removePrefixRegex, '');
      return unixPath;
    }

    var jsFiles = filterForJS( this.filesSrc ).map( function ( file ) {
      return normalizePath(file);
    });

    var cssFiles = filterForCSS( this.filesSrc ).map( function ( file ) {
      return normalizePath(file);
    });

    cssFiles.push(grunt.config('css_path'));
    selectedAppConfiguration = this.data.selectedAppConfiguration;
    grunt.file.copy('src/index.html', this.data.dir + '/index.html', {
      process: function ( contents, path ) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles,
            version: grunt.config( 'pkg.version' ),
            appConfiguration: JSON.stringify(selectedAppConfiguration)
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
