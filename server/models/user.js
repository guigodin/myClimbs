const bcrypt = require("bcrypt-nodejs")
const Sequelize = require("sequelize")

module.exports = (sequelize, DataTypes) => {
	var User = sequelize.define("User", {
		ukcid: DataTypes.INTEGER,
		token: {
			type: Sequelize.STRING(100),
			allowNull: false,
			validate: {
				len: {
					args: [0, 100],
					msg: "Too many characters"
				}
			}
		},
		email: {
			type: Sequelize.STRING(100),
			allowNull: false,
			validate: {
				len: {
					args: [0, 100],
					msg: "Too many characters"
				}
			}
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false
		}
	})

	User.prototype.validPassword = function(password) {
		return new Promise((resolve, reject) => {
			return bcrypt.compare(password, this.password, (err, same) => {
				if (err) {
					return reject(err)
				}
				return resolve(same)
			})
		})
	}
	User.cryptPassword = function(password) {
		return new Promise(function(resolve, reject) {
			bcrypt.genSalt(10, function(err, salt) {
			// Encrypt password using bycrpt module
				if (err) return reject(err)

				bcrypt.hash(password, salt, null, function(err, hash) {
					if (err) return reject(err)
					return resolve(hash)
				})
			})
		})

	}
	User.sync()
	return User
}
