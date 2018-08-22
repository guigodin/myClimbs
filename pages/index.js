import React from "react"
import Head from "next/head"
import Router from "next/router"
import Link from "next/link"
import { Row, Col } from "reactstrap"
import Cookies from "universal-cookie"
import { NextAuth } from "next-auth/client"
import Page from "../components/page"
import Layout from "../components/layout"
import Data from "../components/ukc-data"
import StackChart from "../components/stack-chart"

export default class extends Page {
	constructor(props) {
		super(props)
		this.state = {
			logbook: props.logbook || null,
			routes: props.routes || null,
			crags: props.crags || null,
			grades: props.grades || null,
			styles: props.styles || null
		}
	}

	static async getInitialProps({req, res, query}) {
		let props = await super.getInitialProps({req})
		props.year = query.year
		const cookies = new Cookies((req && req.headers.cookie) ? req.headers.cookie : null)
		cookies.set("redirect_url", "/", { path: "/" })
		if (!props.session.user) {
			if (req) {
				res.redirect("/auth/credentials")
			} else {
				Router.push("/auth/credentials")
			}
		} 
		
		
		return props


	}
	async fetchData() {
		if (this.props.session.user) {
			const details = await Data.getDetails()
			const logbook = await Data.getLogbook()
			return {
				logbook: logbook,
				routes: details.routes,
				crags: details.crags,
				styles: await Data.getStyles(),
				grades: await Data.getGrades(),
				years: Array.isArray(logbook) ?
					logbook
						.map(entry => entry.textAscentDate.substring(0,4))
						.reduce((acc, year) => acc.includes(year) ? acc : acc.concat(year), [])
					: null
			}
		}	else {
			return {
				error: "not logged in"
			}
		}
	}
	async componentDidMount() {
		if (!this.props.logbook) {
			this.setState(await this.fetchData())
		}
	}
	render() {
		if (this.props.session.user) {
			return (
				<Layout navmenu={ false } {...this.props} years={ this.state.years }>
					<h1>Better UKC Graphs - { this.props.year ? this.props.year:"Overall" }</h1>
					<StackChart {...this.state} {...this.props} discipline="tradLead"></StackChart>
					<StackChart {...this.state} {...this.props} discipline="tradSecond"></StackChart>
					<StackChart {...this.state} {...this.props} discipline="top"></StackChart>
					<StackChart {...this.state} {...this.props} discipline="boulder"></StackChart>
					<StackChart {...this.state} {...this.props} discipline="dws"></StackChart>
					<p>{ this.state.years }</p>
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

