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
import {Bar} from "react-chartjs-2"

export default class extends Page {
  
	static async getInitialProps({req, res, query}) {
		let props = await super.getInitialProps({req})
		const options = {}
		if (req) options.headers = {Cookie: req.headers.cookie}
	
		console.log(props)
		if (props.session.user) {
			const fetchStyles = fetch("http://localhost:3000/api/ukc/styles")
			const fetchGrades = fetch("http://localhost:3000/api/ukc/grades")
			const fetchLogbook = fetch("http://localhost:3000/api/ukc/logbook/", options)
			const fetchDetails = fetch("http://localhost:3000/api/ukc/details/", options)
			const fetchTradAggr = fetch("http://localhost:3000/api/ukc/trad/aggr", options)
  
			const stylesRes = await fetchStyles
			const styles = await stylesRes.json()

			const gradesRes = await fetchGrades
			const grades = await gradesRes.json()

			const logbookRes = await fetchLogbook
			const logbook = await logbookRes.json()

			const detailsRes = await fetchDetails
			const details = await detailsRes.json()
   
			const tradAggrRes = await fetchTradAggr
			const tradAggr = await tradAggrRes.json()
			const sorted_grades = Object.keys(tradAggr.grade).sort((a, b) => {
				const score_a = grades[2].grades[a].score
				const score_b = grades[2].grades[b].score
				if (score_a < score_b) return -1
				if (score_a > score_b) return 1
				if (score_a === score_b) return 0
			})
			const bg_colors = [
				[],
				[],
				[
					"#313695",
					"#4575b4",
					"#74add1",
					"#abd9e9",
					"#e0f3f8",
					"#fee090",
					"#fdae61",
					"#f46d43",
					"#d73027",
					"#a50026"
				],[
					"#006837",
					"#1a9850",
					"#66bd63",
					"#a6d96a",
					"#d9ef8b",
					"#fee08b",
					"#fdae61",
					"#f46d43",
					"#d73027",
					"#a50026"
				]
			]

			console.log(sorted_grades, Object.keys(tradAggr.grade))
			const data = {
				grades: grades,
				styles: styles.styles,
				logbook: logbook.logbook,
				routes: details.routes,
				crags: details.crags,
				trad_aggr: tradAggr,
				graph_data: {
					labels: sorted_grades,
					datasets: Object.keys(tradAggr.substyle).map(style => 	{
						return {
							label: styles.styles[style].name,
							backgroundColor: bg_colors[(style - style % 10)/10][style % 10],
							borderColor: "rgba(255,99,132,1)",
							borderWidth: 0,
							hoverBackgroundColor: "rgba(255,99,132,0.4)",
							hoverBorderColor: "rgba(255,99,132,1)",
							data: sorted_grades.map(key => {
								console.log(tradAggr.substyle[style].grade[key])
								return tradAggr.substyle[style].grade[key] ? tradAggr.substyle[style].grade[key]:0
							})
						}
					})
				}
			}
			console.log(data.graph_data)
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
					<Bar data={ this.props.graph_data }></Bar>
					<ul>{ Object.keys(this.props.trad_aggr.grade).map((key) => (
						<li key={ this.props.trad_aggr.grade[key] }>
							{ key }: { this.props.trad_aggr.grade[key].total }
							<ul>{ Object.keys(this.props.trad_aggr.grade[key].style).map((style_key) => (
								<li key={ this.props.trad_aggr.grade[key] + style_key }>
									{ this.props.styles[style_key].name }: { this.props.trad_aggr.grade[key].style[style_key].total }
									<ul>{ Object.keys(this.props.trad_aggr.grade[key].style[style_key].substyle).map((substyle_key) => (
										<li key={ this.props.trad_aggr.grade[key] + style_key + substyle_key }>
											{ this.props.styles[substyle_key].name }: { this.props.trad_aggr.grade[key].style[style_key].substyle[substyle_key] }
										</li>
									))}</ul>
								</li>
							))}</ul>
						</li>
					))}</ul>
					<ul>{ Object.keys(this.props.trad_aggr.style).map((key) => (
						<li key={ this.props.trad_aggr.style[key] }>
							{ this.props.styles[key].name }: { this.props.trad_aggr.style[key].total }
							<ul>{ Object.keys(this.props.trad_aggr.style[key].grade).map((grade) => (
								<li key={ this.props.trad_aggr.style[key] + grade }>
									{ grade }: { this.props.trad_aggr.style[key].grade[grade] }
								</li>
							))}</ul>
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

