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
import {Bar} from "react-chartjs-2"

export default class extends Page {

	async getGraphData(discipline) {
		console.log(this.state)
		const fetchAggr = fetch("/api/ukc/aggr/"+discipline)
		const aggrRes = await fetchAggr
		const aggr = await aggrRes.json()
		const sortedGrades = Object.keys(aggr.grade).sort((a, b) => {
			const score_a = parseInt(this.state.grades[aggr.grade[a].discipline].grades[a].score)
			const score_b = parseInt(this.state.grades[aggr.grade[b].discipline].grades[b].score)
			if (score_a < score_b) return -1
			if (score_a > score_b) return 1
			if (score_a === score_b) return 0
		})
		 const data = {
			scales: {xAxes:[{stacked:true}],yAxes:[{stacked:true}]},
			labels: sortedGrades,
			datasets: Object.keys(aggr.substyle).reverse().map(style => 	{
				return {
					label: this.state.styles[style].name,
					backgroundColor: this.state.bg_colors[style % 10 -1],
					borderColor: "rgba(255,99,132,1)",
					borderWidth: 0,
					hoverBackgroundColor: "rgba(255,99,132,0.4)",
					hoverBorderColor: "rgba(255,99,132,1)",
					data: sortedGrades.map(key => {
						return aggr.substyle[style].grade[key] ? aggr.substyle[style].grade[key].total:0
					})
				}
			})
		}
		return data
	}
	async fetchData() {
		const fetchStyles = fetch("/api/ukc/styles")
		const fetchGrades = fetch("/api/ukc/grades")
		const fetchLogbook = fetch("/api/ukc/logbook/")
		const fetchDetails = fetch("/api/ukc/details/")

		const stylesRes = await fetchStyles
		const styles = await stylesRes.json()

		const gradesRes = await fetchGrades
		const grades = await gradesRes.json()

		const logbookRes = await fetchLogbook
		const logbook = await logbookRes.json()

		const detailsRes = await fetchDetails
		const details = await detailsRes.json()
     
		return {
			grades: grades,
			styles: styles.styles,
			logbook: logbook.logbook,
			routes: details.routes,
			crags: details.crags,
		}
	}

	async componentDidMount() {
		this.setState(await this.fetchData())
		this.setState({
			graphData: {
				top: await this.getGraphData("top"),
				tradLead: await this.getGraphData("tradLead"),
				tradSecond: await this.getGraphData("tradSecond"),
				boulder: await this.getGraphData("boulder"),
				dws: await this.getGraphData("dws")
			}
		})
	}
	constructor(props) {
		super(props)
		this.state = {
			graphData: {
				top: {
					data: {}
				},
				trad: {
					data: {}
				},
				boulder: {
					data: {}
				},
				dws: {
					data: {}
				}
			},
			bg_colors: [
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
			],
			barOptions: {
				scales: {
					xAxes:[{stacked:true}],
					yAxes:[{stacked:true}]
				}
			},

		}
	}
	static async getInitialProps({req, res, query}) {
		let props = await super.getInitialProps({req})
		const cookies = new Cookies((req && req.headers.cookie) ? req.headers.cookie : null)
		cookies.set("redirect_url", "/", { path: "/" })
		if (!props.session.user) {
			if (req) {
				res.redirect("/auth/credentials")
			} else {
				Router.push("/auth/credentials")
			}
		}
		console.log(props)
		return props

	}

	render() {
		if (this.props.session.user) {
			return (
				<Layout navmenu={ false } {...this.props}>
					<h1>Better UKC Graphs</h1>
					<Bar data={ this.state.graphData.tradLead } options={ this.state.barOptions }></Bar>
					<Bar data={ this.state.graphData.tradSecond } options={ this.state.barOptions }></Bar>
					<Bar data={ this.state.graphData.top } options={ this.state.barOptions }></Bar>
					<Bar data={ this.state.graphData.boulder } options={ this.state.barOptions }></Bar>
					<Bar data={ this.state.graphData.dws } options={ this.state.barOptions }></Bar>
				</Layout>
			)
		} else {
			return (
				<Layout {...this.props} navmenu={false} signinBtn={false}>
					<p>
						<Link href="/auth/credentials"><a>login</a></Link>
					</p>
				</Layout>
			)
		}
	}
}

