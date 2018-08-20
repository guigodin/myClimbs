const express = require("express")
const router = express.Router()
const ukc = require("../ukc.js")

router.get("/logbook/:id?", (req, res) => {
	console.log(req.user)
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		ukc.logbook(id, req.user.ukcsid).then(data => {
			return res.status(200).json(data)
		}).catch(err => res.status(500).json(err))
	} else {
		return res.status(403).json({error: "Must be signed in to get logbook"})
	}
})

router.get("/details/:id?", (req, res) => {
	console.log(req.user)
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		ukc.details(id, req.user.ukcsid).then(data => {
			return res.status(200).json(data)
		}).catch(err => res.status(500).json(err))
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

router.get("/top/aggr", async (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		const details = await ukc.details(id, req.user.ukcsid)
		const logbook = await ukc.logbook(id, req.user.ukcsid)
		const top_aggr = logbook.logbook.filter(entry => {
			console.log(entry)
			return (entry.trash == 0 && entry.style > 39 && entry.style < 50)
		}).reduce(
			(aggr, entry) => {
				aggr.total += 1
				const style = entry.style - (entry.style % 10)
				const route = details.routes[entry.ukcID]
				if (!aggr.grade[route.grade]) {
					aggr.grade[route.grade] = {
						total: 0,
						style: {},
						discipline: details.routes[entry.ukcID].gradeType
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
					aggr.style[style].grade[route.grade] = {
						discipline: details.routes[entry.ukcID].gradeType,
						total: 0
					}
				}
				if (!aggr.style[style].substyle[entry.style]) {
					aggr.style[style].substyle[entry.style] = 0
				}
				aggr.style[style].total += 1
				aggr.style[style].grade[route.grade].total += 1
				aggr.style[style].substyle[entry.style] += 1

				if (!aggr.substyle[entry.style]) {
					aggr.substyle[entry.style] = {
						total: 0,
						grade: {}
					}
				}
				if (!aggr.substyle[entry.style].grade[route.grade]) {
					aggr.substyle[entry.style].grade[route.grade] = {
						discipline: details.routes[entry.ukcID].gradeType,
						total: 0
					}
				}
				aggr.substyle[entry.style].total += 1
				aggr.substyle[entry.style].grade[route.grade].total += 1
				return (aggr)
			},
			{total: 0, grade: {}, style:{}, substyle: {}}
		)
		console.log(top_aggr)
		return res.status(200).json(top_aggr)
	} else {
		return res.status(403).json({error: "Must be signed in to get trad agggrgations"})
	}
})

router.get("/trad/aggr", async (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		const details = await ukc.details(id, req.user.ukcsid)
		const logbook = await ukc.logbook(id, req.user.ukcsid)
		const trad_aggr = logbook.logbook.filter(entry => {
			return (entry.trash == 0 && details.routes[entry.ukcID].gradeType.toString().match(2) && entry.style > 19 && entry.style < 40)
		}).reduce(
			(aggr, entry) => {
				aggr.total += 1
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
				if (!aggr.style[style].substyle[entry.style]) {
					aggr.style[style].substyle[entry.style] = 0
				}
				aggr.style[style].total += 1
				aggr.style[style].grade[route.grade] += 1
				aggr.style[style].substyle[entry.style] += 1

				if (!aggr.substyle[entry.style]) {
					aggr.substyle[entry.style] = {
						total: 0,
						grade: {}
					}
				}
				if (!aggr.substyle[entry.style].grade[route.grade]) {
					aggr.substyle[entry.style].grade[route.grade] = 0
				}
				aggr.substyle[entry.style].total += 1
				aggr.substyle[entry.style].grade[route.grade] += 1
				return (aggr)
			},
			{total: 0, grade: {}, style:{}, substyle: {}}
		)
		console.log(trad_aggr)
		return res.status(200).json(trad_aggr)
	} else {
		return res.status(403).json({error: "Must be signed in to get trad agggrgations"})
	}
})


router.get("/boulder/aggr", async (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		const details = await ukc.details(id, req.user.ukcsid)
		const logbook = await ukc.logbook(id, req.user.ukcsid)
		const grades = await ukc.grades()
		const boulder_aggr = logbook.logbook.filter(entry => {
			return (entry.style > 49 && entry.style < 60 && entry.trash == 0)
		}).reduce(
			(aggr, entry) => {
				aggr.total += 1
				const style = entry.style - (entry.style % 10)
				const route = details.routes[entry.ukcID]
				const grade = route.grade.startsWith("V") ? grades[9].grades[route.grade].score:grades[10].grades[route.grade].score
				if (!aggr.grade[grade]) {
					aggr.grade[grade] = {
						total: 0,
						style: {}
					}
				}
				if (!aggr.grade[grade].style[style]) {
					aggr.grade[grade].style[style] = {
						total: 0,
						substyle: {}
					}
				}
				if (!aggr.grade[grade].style[style].substyle[entry.style]) {
					aggr.grade[grade].style[style].substyle[entry.style] = 0
				}
				aggr.grade[grade].total += 1
				aggr.grade[grade].style[style].total += 1
				aggr.grade[grade].style[style].substyle[entry.style] += 1
				if (!aggr.style[style]) {
					aggr.style[style] = {
						total: 0,
						substyle: {},
						grade: {}
					}
				}
				if (!aggr.style[style].grade[grade]) {
					aggr.style[style].grade[grade] = 0
				}
				if (!aggr.style[style].substyle[entry.style]) {
					aggr.style[style].substyle[entry.style] = 0
				}

				aggr.style[style].total += 1
				aggr.style[style].grade[grade] += 1
				aggr.style[style].substyle[entry.style] += 1

				if (!aggr.substyle[entry.style]) {
					aggr.substyle[entry.style] = {
						total: 0,
						grade: {}
					}
				}
				if (!aggr.substyle[entry.style].grade[grade]) {
					aggr.substyle[entry.style].grade[grade] = 0
				}
				aggr.substyle[entry.style].total += 1
				aggr.substyle[entry.style].grade[grade] += 1
				return (aggr)
			},
			{total: 0, grade: {}, style:{}, substyle: {}}
		)
		console.log(boulder_aggr)
		return res.status(200).json(boulder_aggr)
	} else {
		return res.status(403).json({error: "Must be signed in to get trad agggrgations"})
	}
})

router.get("/dws/aggr", async (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		const details = await ukc.details(id, req.user.ukcsid)
		const logbook = await ukc.logbook(id, req.user.ukcsid)
		const dws_aggr = logbook.logbook.filter(entry => {
			return (entry.style > 69 && entry.style < 80 && entry.trash == 0)
		}).reduce(
			(aggr, entry) => {
				aggr.total += 1
				const style = entry.style - (entry.style % 10)
				const route = details.routes[entry.ukcID]
				if (!aggr.grade[route.grade]) {
					aggr.grade[route.grade] = {
						total: 0,
						style: {},
						discipline: details.routes[entry.ukcID].gradeType
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
					aggr.style[style].grade[route.grade] = {
						total: 0,
						discipline: details.routes[entry.ukcID].gradeType
					}
				}
				if (!aggr.style[style].substyle[entry.style]) {
					aggr.style[style].substyle[entry.style] = 0
				}
				aggr.style[style].total += 1
				aggr.style[style].grade[route.grade].total += 1
				aggr.style[style].substyle[entry.style] += 1

				if (!aggr.substyle[entry.style]) {
					aggr.substyle[entry.style] = {
						total: 0,
						grade: {}
					}
				}
				if (!aggr.substyle[entry.style].grade[route.grade]) {
					aggr.substyle[entry.style].grade[route.grade] = {
						total: 0,
						discipline: details.routes[entry.ukcID].gradeType
					}
				}
				aggr.substyle[entry.style].total += 1
				aggr.substyle[entry.style].grade[route.grade].total += 1
				return (aggr)
			},
			{total: 0, grade: {}, style:{}, substyle: {}}
		)
		console.log(dws_aggr)
		return res.status(200).json(dws_aggr)
	} else {
		return res.status(403).json({error: "Must be signed in to get trad agggrgations"})
	}
})

module.exports = router
