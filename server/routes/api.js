const fetch = require("isomorphic-unfetch")
const express = require("express")
const router = express.Router()
const User = require("../models").User

const UKC_API = "https://api.ukclimbing.com/site/logbook/v1"

const headers = token => ({headers: {Cookie: "ukcsid=" + token}})

router.get("/logbook/:id?", (req, res) => {
	
	if (req.user) {
		User.findById(req.user.id).then(user => {
			const id = req.params.id ? req.params.id:user.ukcid
			fetch(UKC_API + "/logbook_ukc/userID=" + id, headers(user.token))
				.then(r => {
					if (r.ok) {
						r.json().then(data => res.status(200).json(data))
					} else {
						r.text().then(data => res.status(500).send(data))
					}
				})
				.catch(err => res.status(500).body(err))
		})
	} else {
		return res.status(403).json({error: "Must be signed in to get logbook"})
	}
})

router.get("/details/:id?", (req, res) => {
	if (req.user) {
		User.findById(req.user.id).then(user => {
			const id = req.params.id ? req.params.id:user.ukcid
			fetch(UKC_API + "/logbook_route_details_ukc/userID=" + id, headers(user.token))
				.then(r => {
					if (r.ok) {
						r.json()
							.then(
								data => res.status(200)
									.json({
										routes: data.routes.reduce((map, route) => (map[route.ukcID] = route, map), {}),
										crags: data.crags
									}))
					} else {
						r.text().then(data => res.status(500).send(data))
					}
				})
				.catch(err => res.status(500).body(err))
		})
	} else {
		return res.status(403).json({error: "Must be signed in to get logbook"})
	}
})

router.get("/crag/:id", (req, res) => {
	fetch(UKC_API + "/crag_ukc/" + req.params.id)
		.then(r => {
			if (r.ok) {
				r.json().then(data => res.status(200).json(data[0]))
			} else {
				r.text().then(data => res.status(500).send(data))
			}
		})
		.catch(err => res.status(500).body(err))
})

router.get("/styles", (req, res) => {
	fetch(UKC_API + "/styles")
		.then(r => {
			if (r.ok) {
				r.json().then(data => res.status(200).json(data))
			} else {
				r.text().then(data => res.status(500).send(data))
			}
		})
		.catch(err => res.status(500).body(err))
})

router.get("/grades", (req, res) => {
	fetch(UKC_API + "/grades")
		.then(r => {
			if (r.ok) {
				r.json().then(data => res.status(200).json(data))
			} else {
				r.text().then(data => res.status(500).send(data))
			}
		})
		.catch(err => res.status(500).body(err))
})
module.exports = router
