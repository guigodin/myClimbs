import fetch from "isomorphic-unfetch"
import React from "react"
import Head from "next/head"
import Router from "next/router"
import Link from "next/link"
import { Row, Col } from "reactstrap"
import Cookies from "universal-cookie"
import { NextAuth } from "next-auth/client"
import Page from "../components/page"
import Layout from "../components/layout"
import SignIn from "../components/signin"

export default class extends Page {
  
	static async getInitialProps({req, res, query}) {
		let props = await super.getInitialProps({req})
		if (props.session.user) {
			const fetchStyles = fetch("http://localhost:3000/api/styles")
			const fetchGrades = fetch("http://localhost:3000/api/grades")
			const fetchLogbook = fetch("http://localhost:3000/api/logbook/", {headers: {Cookie: req.headers.cookie}} )
			const fetchDetails = fetch("http://localhost:3000/api/details/", {headers: {Cookie: req.headers.cookie}} )
  
			const stylesRes = await fetchStyles
			const styles = await stylesRes.json()

			const gradesRes = await fetchGrades
			const grades = await gradesRes.json()

			const logbookRes = await fetchLogbook
			const logbook = await logbookRes.json()

			const detailsRes = await fetchDetails
			const details = await detailsRes.json()

			const data = {
				grades: grades,
				styles: styles.styles,
				logbook: logbook.logbook,
				routes: details.routes,
				crags: details.crags,
			}
			const trad_grades = Object.keys(data.grades[2].grades).reduce(
				(map, grade) => (
					map[grade]= 0,
					map),
				{}
			)
			data.trad_aggr = data.logbook
				.filter(entry => data.routes[entry.ukcID].gradeType.toString().match(2))
				.reduce((aggr, entry) => (aggr[data.routes[entry.ukcID].grade] += 1, aggr), trad_grades )
    
			return Object.assign(props, data)
		}
		const cookies = new Cookies((req && req.headers.cookie) ? req.headers.cookie : null)
		cookies.set("redirect_url", "/", { path: "/" })
		if (req) {
			res.redirect("/auth/credentials")
		} else {
			Router.push("/auth/credentials")
		}
		return props

	}

	render() {
		if (this.props.session.user) {
			return (
				<Layout {...this.props}>
					<h1>Better UKC Graphs</h1>
					<ul>{ Object.keys(this.props.trad_aggr).map((key) => (
						<li key={ this.props.trad_aggr[key] }>
							{ key }: { this.props.trad_aggr[key] }
						</li>
					))}</ul>
					<ul>{ this.props.logbook.map((entry) => (
						<li key={ entry.id }>
							<p>{ entry.name }</p>
							<p>{ this.props.grades[this.props.routes[entry.ukcID].gradeType].gradesystem_name }</p>
							<p>{ this.props.routes[entry.ukcID].grade }</p>
						</li>
					))}</ul>
				</Layout>
			)
		} else {
			return (
				<Layout {...this.props} navmenu={false} signinBtn={false}>
					<h1 className="text-center display-4 mt-5">Sign up / Sign in</h1>
					<Row className="mb-5">
						<Col lg="8" className="mr-auto ml-auto" style={{marginBottom: 20}}>
							<SignIn session={this.props.session} providers={this.props.providers}/>
						</Col>
					</Row>
				</Layout>
			)
		}
	}
}

