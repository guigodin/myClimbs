const fetch = require("isomorphic-unfetch")
const needle = require("needle")
const UKC_API = "https://api.ukclimbing.com/site/logbook/v1"
const https = require("https")
const headers = token => ({headers: {Cookie: "ukcsid=" + token}})



module.exports = {
	login: (username, password) => {
		return new Promise((resolve, reject) => {
			const postData = "login=1&cookie=2&email="+username+"&password="+password+"&ref=/"
			const login_headers = {
				cookie: "bbb_name="+username,
				"Content-Type": "application/x-www-form-urlencoded",
			}
			needle.post("https://www.ukclimbing.com/user/", postData, {
				headers: login_headers
			}, (err, r) => {
				const regex = /ukcsid=([^;]+);/
				console.log(r.headers["set-cookie"].filter(cookie => cookie.startsWith("ukcsid"))[0].match(regex)[1])
			})
		})
	},
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
