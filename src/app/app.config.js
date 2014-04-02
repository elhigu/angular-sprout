/**
 * This is populated from variables from build which were written to index.html
 */
angular.module( 'app.config', [] )

.factory( 'ConfService', function() {
	return {
		be : window.appConfiguration.backend
	};
})

;