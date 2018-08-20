const express = require("express")
const router = express.Router()

const ukcRouter = require("./ukc")
router.use("/ukc", ukcRouter)

module.exports = router
