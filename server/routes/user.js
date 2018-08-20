const express = require("express")
const router = express.Router()
const User = require("../models").User


router.get("/get", (req, res) => {
	if (req.user) {
		User.findById(req.user.id).then(user => {
			res.status(200).json(user)
		})
	}
})
router.put("/update", (req, res) => {
	if (req.user) {
		User.findById(req.user.id).then(user => {
			if (!user) return res.status(500).json({error: "Unable to fetch profile"})

			if (req.body.ukcid) {
				user.ukcid = req.body.ukcid
			}
			if (req.body.token) {
				user.token = req.body.token
			}
			if (req.body.email) {
				user.email = req.body.email
			}
			if (req.body.password) {
				user.password = User.cryptPassword(req.body.password)
			}
			user.save().then(() => {
				return res.status(204).json({msg: "success"})
			})
		}).catch(err => {
			return res.status(500).json({error: "Unable to fetch profile"})        
		})
	} else {
		return res.status(403).json({error: "Must be signed in to update profile"})
	}
})
router.delete("/delete", (req, res) => {
	if (req.user) {
		User.findById(req.user.id).then(user => {
			if (!user) return res.status(500).json({error: "Unable to fetch profile"})
			user.destroy().then(() => {
				return res.status(204).json({msg: "success"})
			})
		}).catch(err => {
			return res.status(500).json({error: "Unable to fetch profile"})        
		})
	} else {
		return res.status(403).json({error: "Must be signed in to update profile"})
	}
})

module.exports = router
