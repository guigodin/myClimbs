const express = require("express")
const router = express.Router()
const ukc = require("../ukc.js")

router.get("/logbook/:id?", (req, res) => {
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

router.get("/aggr/:discipline", async (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		const details = await ukc.details(id, req.user.ukcsid)
		const logbook = await ukc.logbook(id, req.user.ukcsid)
		const options = {}
		switch(req.params.discipline) {
		case "tradLead":
			options.up = 30
			options.down = 19
			options.discipline = 2
			options.gradeType = ((route) => 2	)
			break
		case "tradSecond":
			options.up = 40
			options.discipline = 2
			options.down = 29
			options.gradeType = (route) => 2
			break
		case "top":
			options.up = 50
			options.discipline = 2
			options.down = 39
			options.gradeType = (route) => 2
			break
		case "boulder":
			options.up = 60
			options.down = 49
			options.discipline = /.*/
			options.gradeType = (route) => route.grade.startsWith("V") ? 9:10
			break
		case "dws":
			options.up = 80
			options.down = 69
			options.discipline = /.*/
			options.gradeType = (route) => {
				if (route.gradeType === 4) return route.grade.startsWith("V") ? 9:10
				return route.gradeType
			}
			break
		default:
			return res.status(404).json({error: "no such aggregation"})
		}
		const trad_aggr = logbook.logbook.filter(entry => {
			return (
				entry.trash == 0 && 
				details.routes[entry.ukcID].gradeType
					.toString().match(options.discipline) &&
				entry.style > options.down && 
				entry.style < options.up
			)
		}).reduce(
			(aggr, entry) => {
				aggr.total += 1
				const style = entry.style - (entry.style % 10)
				const route = details.routes[entry.ukcID]
				const discipline = options.gradeType(route)
				if (!aggr.grade[route.grade]) {
					aggr.grade[route.grade] = {
						total: 0,
						style: {},
						discipline: discipline
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
						discipline: discipline
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
						discipline: discipline
					}
				}
				aggr.substyle[entry.style].total += 1
				aggr.substyle[entry.style].grade[route.grade].total += 1
				return (aggr)
			},
			{total: 0, grade: {}, style:{}, substyle: {}}
		)
		return res.status(200).json(trad_aggr)
	} else {
		return res.status(403).json({error: "Must be signed in to get agggrgations"})
	}
})


module.exports = router
