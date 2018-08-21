const ukc = require("./server/ukc")

module.exports = () => {
	return Promise.resolve({
		find: ({id, email, emailToken, provider} = {}) => {
			if (id) {
				return Promise.resolve(id)
			} else {
				return Promise.reject()
			} 
		},
		signIn: ({form, req}) => {
			return new Promise((resolve, reject) => {
				return ukc.login(form.email, form.password)
					.then(ukcsid => resolve(ukcsid))
					.catch(err => console.log(err))
			
				/*
				return User.findOne({ where: {email: form.email }}).then(user => {
					if (user) {
						return user.validPassword(form.password)
							.then(same => {
								if (same) {
									return resolve(user)
								}
								return resolve(null)
							}).catch(err => console.log(err))
						
					}
					return resolve(null)
				}) */
			})
		},
		// Seralize turns the value of the ID key from a User object
		serialize: (ukcsid) => {
			// Supports serialization from Mongo Object *and* deserialize() object
			if (ukcsid) {
				return Promise.resolve(ukcsid)
			} else {
				return Promise.reject({error: "No ukcsid given"})
			}

		},
		// Deseralize turns a User ID into a normalized User object that is
		// exported to clients. It should not return private/sensitive fields,
		// only fields you want to expose via the user interface.
		deserialize: (ukcsid) => {
			return new Promise((resolve, reject) => {
				const matches = ukcsid.match(/.+#(.+)#(.+)#.+/)
				if (matches) {
					return resolve({
						id: matches[1],
						username: matches[2],
						ukcsid: ukcsid
					})
				} else {
					return reject({error: "couldn't parse ukcsid"})
				}
			})
		}
	})
}
