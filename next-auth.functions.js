const User =  require("./server/models").User

module.exports = () => {
	return Promise.resolve({
		find: ({id, email, emailToken, provider} = {}) => {
			if (id) {
				return new Promise((resolve, reject) =>
					User.findById(id).then(user => {
						return resolve(user)
					})
				)
			} else if (email) {
				return new Promise((resolve, reject) =>
					User.findOne({where: {email: email}}).then(user => {
						return resolve(user)
					})
				)
			} 
		},
		signIn: ({form, req}) => {
			return new Promise((resolve, reject) => {
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
				})
			})
		},
		    // Seralize turns the value of the ID key from a User object
		serialize: (user) => {
			// Supports serialization from Mongo Object *and* deserialize() object
			if (user.id) {
				// Handle responses from deserialize()
				return Promise.resolve(user.id)
			} else if (user._id) {
				// Handle responses from find(), insert(), update()
				return Promise.resolve(user._id)
			} else {
				return Promise.reject(new Error("Unable to serialise user"))
			}
		},
		// Deseralize turns a User ID into a normalized User object that is
		// exported to clients. It should not return private/sensitive fields,
		// only fields you want to expose via the user interface.
		deserialize: (id) => {
			return new Promise((resolve, reject) => {
				User.findById(id).then(user => {
              
					// If user not found (e.g. account deleted) return null object
					if (!user) return resolve(null)
              
					return resolve({
						id: user.id,
						email: user.email
					})
				})
			})
		}
	})
}
