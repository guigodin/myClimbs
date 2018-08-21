const next = require("next")
const nextAuth = require("next-auth")
const dev = process.env.NODE_ENV !== "production"
const nextAuthConfig = require("./next-auth.config")
const apiRoutes = require("./server/routes")
const port = process.env.PORT || 3000

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
		server.get("/year/:year?", (req, res) => {
			return nextApp.render(req, res, "/", req.params)
		})
		server.get("*", (req, res) => {
			return handle(req, res)
		})
		server.listen(port, (err) => {
			if (err) throw err
			console.log("> Ready on http://localhost:" + port)
		})
	})
	.catch((ex) => {
		console.error(ex.stack)
		throw ex
		process.exit(1)
	})
