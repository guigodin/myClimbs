import fetch from "isomorphic-unfetch"
const API_URL = (process.env.API_URL ? process.env.API_URL:"") + "/api/ukc"
export default class {
	static async getAggr(discipline, year) {
		const fetchAggr = fetch(API_URL+"/aggr/"+discipline+( year ? "/" + year : ""))
		const aggrRes = await fetchAggr
		return await aggrRes.json()
	}
	static async getStyles() {
		const fetchStyles = fetch(API_URL+"/styles")
		const stylesRes = await fetchStyles
		return await stylesRes.json()
	}
	static async getGrades() {
		const fetchGrades = fetch(API_URL+"/grades")
		const gradesRes = await fetchGrades
		return await gradesRes.json()
	}
	static async getLogbook() {
		const fetchLogbook = fetch(API_URL+"/logbook/")
		const logbookRes = await fetchLogbook
		return await logbookRes.json()
	}
	static async getDetails() {
		const fetchDetails = fetch(API_URL+"/details/")
		const detailsRes = await fetchDetails
		return await detailsRes.json()
	}
}
