const fetch = require("isomorphic-unfetch")
const express = require("express")
const router = express.Router()
const User = require("../models").User
const ukc = require("../ukc.js")
const UKC_API = "https://api.ukclimbing.com/site/logbook/v1"

router.get("/logbook/:id?", (req, res) => {
	
	if (req.user) {
		User.findById(req.user.id).then(user => {
			const id = req.params.id ? req.params.id:user.ukcid
			ukc.logbook(id, user.token).then(data => {
				return res.status(200).json(data)
			}).catch(err => res.status(500).body(err))
		})
	} else {
		return res.status(403).json({error: "Must be signed in to get logbook"})
	}
})

router.get("/details/:id?", (req, res) => {
	if (req.user) {
		User.findById(req.user.id).then(user => {
			const id = req.params.id ? req.params.id:user.ukcid
			ukc.details(id, user.token).then(data => {
				return res.status(200).json(data)
			}).catch(err => res.status(500).body(err))
		})
	} else {
		return res.status(403).json({error: "Must be signed in to get logbook"})
	}
})

router.get("/crag/:id", (req, res) => {
	ukc.crag(req.params.id).then(data => {
		return res.status(200).json(data)
	}).catch(err => res.status(500).json(err))
})

router.get("/styles", (req, res) => {
	ukc.styles().then(data => {
		return res.status(200).json(data)
	}).catch(err => res.status(500).json(err))
})

router.get("/grades", (req, res) => {
	ukc.grades().then(data => {
		return res.status(200).json(data)
	}).catch(err => res.status(500).json(err))
})

router.get("/trad/aggr", (req, res) => {
	if (req.user) {
		User.findById(req.user.id).then(async (user) => {
			const id = req.params.id ? req.params.id:user.ukcid
			const details = await ukc.details(id, user.token)
			const logbook = await ukc.logbook(id, user.token)
			const trad_aggr = logbook.logbook.filter(entry => {
				return (details.routes[entry.ukcID].gradeType.toString().match(2) && entry.style > 19 && entry.style < 40)
			}).reduce(
				(aggr, entry) => {
					const style = entry.style - (entry.style % 10)
					const route = details.routes[entry.ukcID]
					if (!aggr.grade[route.grade]) {
						aggr.grade[route.grade] = {
							total: 0,
							style: {}
						}
					}
					if (!aggr.grade[route.grade].style[style]) {
						aggr.grade[route.grade].style[style] = {
							total: 0,
							substyle: {}
						}
					}
					if (!aggr.grade[route.grade].style[style].substyle[entry.style]) {
						aggr.grade[route.grade].style[style].substyle[entry.style] = 0
					}
					aggr.grade[route.grade].total += 1
					aggr.grade[route.grade].style[style].total += 1
					aggr.grade[route.grade].style[style].substyle[entry.style] += 1
					if (!aggr.style[style]) {
						aggr.style[style] = {
							total: 0,
							substyle: {},
							grade: {}
						}
					}
					if (!aggr.style[style].grade[route.grade]) {
						aggr.style[style].grade[route.grade] = 0
					}
					aggr.style[style].total += 1
					aggr.style[style].grade[route.grade] += 1
					aggr.style[style].substyle[entry.style] += 1

					if (!aggr.substyle[entry.style]) {
						aggr.substyle[entry.style] = {
							total: 0,
							style: {},
							grade: {}
						}
					}
					if (!aggr.substyle[entry.style].grade[route.grade]) {
						aggr.substyle[entry.style].grade[route.grade] = 0
					}
					aggr.substyle[entry.style].total += 1
					aggr.substyle[entry.style].grade[route.grade] += 1
					aggr.substyle[entry.style].style[style] += 1
					return (aggr)
				},
				{total: 0, grade: {}, style:{}, substyle: {}}
			)
			console.log(trad_aggr)
			return res.status(200).json(trad_aggr)
		}).catch(err => {
			console.log(err)
		})
	} else {
		return res.status(403).json({error: "Must be signed in to get trad agggrgations"})
	}
})


module.exports = router
