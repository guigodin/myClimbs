const nextAuthFunctions = require("./next-auth.functions")

const expressSession = require("express-session")
const SQLiteStore = require("connect-sqlite3")(expressSession)

module.exports = () => {
	return nextAuthFunctions()
		.then(functions => {
			return new Promise((resolve, reject) => {    
				// This is the config block we return, ready to be passed to NextAuth
				resolve({
					// Define a port (if none passed, will not start Express)
					// port: process.env.PORT || 3001,
					// Secret used to encrypt session data on the server.
					sessionSecret: "sddfgffgdf",
					// Maximum Session Age in ms (optional, default is 7 days).
					// The expiry time for a session is reset every time a user revisits 
					// the site or revalidates their session token. This is the maximum 
					// idle time value.
					sessionMaxAge: 60000 * 60 * 24 * 7,
					// Session Revalidation in X ms (optional, default is 60 seconds).
					// Specifies how often a Single Page App should revalidate a session.
					// Does not impact the session life on the server, but causes clients 
					// to refetch session info (even if it is in a local cache) after N 
					// seconds has elapsed since it was last checked so they always display 
					// state correctly.
					// If set to 0 will revalidate a session before rendering every page.
					sessionRevalidateAge: 60000,
					// Canonical URL of the server (optiona, but recommended).
					// e.g. 'http://localhost:3000' or 'https://www.example.com' 
					// Used in callbak URLs and email sign in links. It will be auto 
					// generated if not specified, which may cause problems if your site 
					// uses multiple aliases (e.g. 'example.com and 'www.examples.com').
					serverUrl: process.env.SERVER_URL || null,
					// Add an Express Session store.
					expressSession: expressSession,
					sessionStore: new SQLiteStore(),
					// Define oAuth Providers
					providers: [],
					// Define functions for manging users and sending email.
					functions: functions
				})
			})
		})
}
