const express = require("express")
const router = express.Router()

const userRouter = require("./user")
router.use("/user", userRouter)

const ukcRouter = require("./ukc")
router.use("/ukc", ukcRouter)

module.exports = router
