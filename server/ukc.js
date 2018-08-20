const fetch = require("isomorphic-unfetch")

const UKC_API = "https://api.ukclimbing.com/site/logbook/v1"

const headers = token => ({headers: {Cookie: "ukcsid=" + token}})



module.exports = {
	logbook: (id, token) => {
		return new Promise((resolve, reject) => {
			fetch(UKC_API + "/logbook_ukc/userID=" + id, headers(token))
				.then(r => {
					if (r.ok) {
						r.json().then(data => {
							return resolve(data)
						})
					} else {
						r.text().then(data => {
							return reject(data)
						})
					}
				})
		})
	},
	details: (id, token) => {
		return new Promise((resolve, reject) => {
			fetch(UKC_API + "/logbook_route_details_ukc/userID=" + id, headers(token))
				.then(r => {
					if (r.ok) {
						r.json().then(data => {
							return resolve({
								routes: data.routes.reduce((map, route) => (map[route.ukcID] = route, map), {}),
								crags: data.crags
							})
						})
					} else {
						r.text().then(data => {
							return reject(data)
						})
					}
				})
		})		
	},
	crag: (id) => {
		return new Promise((resolve, reject) => {
			fetch(UKC_API + "/crag_ukc/" + id)
				.then(r => {
					if (r.ok) {
						r.json().then(data => {
							return resolve(data)
						})
					} else {
						r.text().then(data => {
							return reject(data)
						})
					}
				})
		})		
	},
	grades: () => {
		return new Promise((resolve, reject) => {
			fetch(UKC_API + "/grades")
				.then(r => {
					if (r.ok) {
						r.json().then(data => {
							return resolve(data)
						})
					} else {
						r.text().then(data => {
							return reject(data)
						})
					}
				})
		})		
	},
	styles: () => {
		return new Promise((resolve, reject) => {
			fetch(UKC_API + "/styles")
				.then(r => {
					if (r.ok) {
						r.json().then(data => {
							return resolve(data)
						})
					} else {
						r.text().then(data => {
							return reject(data)
						})
					}
				})
		})		
	}
}
