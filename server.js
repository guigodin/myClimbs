const next = require("next")
const nextAuth = require("next-auth")
const dev = process.env.NODE_ENV !== "production"
const nextAuthConfig = require("./next-auth.config")
const apiRoutes = require("./server/routes")

// Initialize Next.js
const nextApp = next({ dev, quiet: false })

const handle = nextApp.getRequestHandler()

// Add next-auth to next app
nextApp
	.prepare()
	.then(() => {
		return nextAuthConfig()
	})
	.then(nextAuthOptions => {
	  return nextAuth(nextApp, nextAuthOptions)  
	})
	.then(nextAuthAppOptions => {
    
		const server = nextAuthAppOptions.expressApp
		const express = nextAuthAppOptions.express
		server.use("/api", apiRoutes)
		server.use("/fonts/ionicons", express.static("./node_modules/ionicons/dist/fonts"))
		server.get("*", (req, res) => {
			return handle(req, res)
		})
		server.listen(3000, (err) => {
			if (err) throw err
			console.log("> Ready on http://localhost:3000")
		})
	})
	.catch((ex) => {
		console.error(ex.stack)
		throw ex
		process.exit(1)
	})
