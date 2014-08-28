/**
 * Profile to use when doing development. Allows to choose different 
 * backend for development.
 *
 * Deployment backend is configured in build.config.js it should not be changed.
 * 
 * NOTE: IF YOU CHANGE THIS FILE, CHANGES ARE NOT RECOGNIZED UNTIL YOU RUN
 *       grunt --profile=dev-mikael
 */

module.exports = {
	dev : {
		appConfiguration : {
			backend : 'http://localhost:9090/resource'
		}
	}
};
