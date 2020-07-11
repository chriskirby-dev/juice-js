define('/js/app/config', function AppConfig(){
	console.log('Config Nodule', this, arguments );
	return {
		debug: false,
		paths: {
			app: 'js/app',
			controllers: 'js/app/controllers',
			lib: 'js/app/lib',
			plugin: 'js/app/plugin',
			bitmex: 'js/app/bitmex'
		}
	};
	
});