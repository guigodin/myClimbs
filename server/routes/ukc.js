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

router.get("/years/:id?", (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id

		ukc.logbook(id, req.user.ukcsid).then(data => {
			data.map(entry => entry.textAscentDate.substring(0,4))
				.reduce((acc, year) => acc.includes(year) ? acc : acc.concat(year), [])
		})
	}  else {

		return res.status(403).json({error: "Must be signed in"})
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

router.get("/aggr/:discipline/:year?", async (req, res) => {
	if (req.user) {
		const id = req.params.id ? req.params.id:req.user.id
		const grades = await ukc.grades().catch(err => {
			throw err
		})
		const details = await ukc.details(id, req.user.ukcsid).catch(err => {
			throw err
		})
		const logbook = await ukc.logbook(id, req.user.ukcsid).catch(err => {
			throw err
		})
		const options = {
			year: req.params.year ? req.params.year:/.*/,
			getGrade: (route) => {
				if (route.gradeType === 4) {
					const discipline = route.grade.startsWith("V") ? 9:10
					const grade = Object.keys(grades[10].grades).filter(key => grades[10].grades[key].score === grades[discipline].grades[route.grade].score)[0]
					return {discipline: 10, name: grade}
				}
				return {discipline: route.gradeType, name: route.grade}
			}
		}
		switch(req.params.discipline) {
		case "tradLead":
			options.up = 30
			options.down = 19
			options.discipline = 2
			break
		case "tradSecond":
			options.up = 40
			options.discipline = 2
			options.down = 29
			break
		case "top":
			options.up = 50
			options.discipline = /.*/
			options.down = 39
			break
		case "boulder":
			options.up = 60
			options.down = 49
			options.discipline = /.*/
			break
		case "dws":
			options.up = 80
			options.down = 69
			options.discipline = /.*/
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
				entry.style < options.up &&
				entry.textAscentDate.match(options.year)
			)
		}).reduce(
			(aggr, entry) => {
				aggr.total += 1
				const style = entry.style - (entry.style % 10)
				const route = details.routes[entry.ukcID]
				const grade = options.getGrade(route)
				if (!aggr.grade[grade.name]) {
					aggr.grade[grade.name] = {
						total: 0,
						style: {},
						discipline: grade.discipline
					}
				}
				if (!aggr.grade[grade.name].style[style]) {
					aggr.grade[grade.name].style[style] = {
						total: 0,
						substyle: {}
					}
				}
				if (!aggr.grade[grade.name].style[style].substyle[entry.style]) {
					aggr.grade[grade.name].style[style].substyle[entry.style] = 0
				}
				aggr.grade[grade.name].total += 1
				aggr.grade[grade.name].style[style].total += 1
				aggr.grade[grade.name].style[style].substyle[entry.style] += 1
				if (!aggr.style[style]) {
					aggr.style[style] = {
						total: 0,
						substyle: {},
						grade: {}
					}
				}
				if (!aggr.style[style].grade[grade.name]) {
					aggr.style[style].grade[grade.name] = {
						total: 0,
						discipline: grade.discipline
					}
				}
				if (!aggr.style[style].substyle[entry.style]) {
					aggr.style[style].substyle[entry.style] = 0
				}
				aggr.style[style].total += 1
				aggr.style[style].grade[grade.name].total += 1
				aggr.style[style].substyle[entry.style] += 1

				if (!aggr.substyle[entry.style]) {
					aggr.substyle[entry.style] = {
						total: 0,
						grade: {}
					}
				}
				if (!aggr.substyle[entry.style].grade[grade.name]) {
					aggr.substyle[entry.style].grade[grade.name] = {
						total: 0,
						discipline: grade.discipline
					}
				}
				aggr.substyle[entry.style].total += 1
				aggr.substyle[entry.style].grade[grade.name].total += 1
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
