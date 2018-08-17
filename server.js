const next = require("next")
const nextAuth = require("next-auth")
const dev = process.env.NODE_ENV !== "production"
const nextAuthConfig = require("./next-auth.config")
const apiRoutes = require("./server/routes/api.js")
const User =  require("./server/models").User

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
		server.use("/api", apiRoutes)
		server.get("*", (req, res) => {
			return handle(req, res)
		})
		if (dev) {
			User.findOne({where: {email: "g@g.g"}})
				.then(user => {
					if (!user) {
						User.cryptPassword("g").then(hash => {
							User.create({
								email: "g@g.g",
								password: hash,
								ukcid: "236258",
								token: "a219ebc809dc3ac534d736157ca28fe8#236258#Gugodi#0"
							})
						})
					}
				})
		}
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
