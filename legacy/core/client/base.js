define('client', ['client/cookies', 'client/browser', 'client/user' ], function Client( cookies, browser, user ){
	return {
		cookies: cookies,
		browser: browser,
		user: user
	};
});