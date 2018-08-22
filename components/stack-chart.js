import React from "react"
import Data from "./ukc-data"
import {Bar} from "react-chartjs-2"

export default class extends React.Component {
	static propTypes() {
		return {
			session: React.PropTypes.object.isRequired,
			grades: React.PropTypes.object.isRequired,
			styles: React.PropTypes.object.isRequired,
			routes: React.PropTypes.object.isRequired,
			logbook: React.PropTypes.object.isRequired,
			discipline: React.PropTypes.string.isRequired,
			years: React.PropTypes.array.isRequired,
			userid: React.PropTypes.number
		}
	}
	
	constructor(props) {
		super(props)
		this.state = {
			barOptions: {
				scales: {
					xAxes:[{stacked:true}],
					yAxes:[{stacked:true}]
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
			]
		}
	}

	buildGraph(aggr) {
		const sortedGrades = Object.keys(aggr.grade).sort((a, b) => {
			const score_a = parseInt(this.props.grades[aggr.grade[a].discipline].grades[a].score)
			const score_b = parseInt(this.props.grades[aggr.grade[b].discipline].grades[b].score)
			if (score_a < score_b) return -1
			if (score_a > score_b) return 1
			if (score_a === score_b) return 0
		})
		return {
			scales: {xAxes:[{stacked:true}],yAxes:[{stacked:true}]},
			labels: sortedGrades,
			datasets: Object.keys(aggr.substyle).reverse().map(style => 	{
				return {
					label: this.props.styles[style].name,
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
	}
	
	async updateGraphData() {
		if (this.props.session.user && this.props.logbook) {
			const aggr = await Data.getAggr(this.props.discipline, this.props.year)
			return this.buildGraph(aggr)
		}
	}

	async componentDidUpdate(prevProps) {
		if (this.props.logbook != prevProps.logbook) {
			this.setState({
				graphData: await this.updateGraphData()
			})
		}
	}

	async componentDidMount() {
		if (this.props.logbook != null) {
			this.setState({
				graphData: await this.updateGraphData()
			})
		}
	}
	render() {
		return (
			<div>
				<Bar data={ this.state.graphData }  options={ this.state.barOptions }></Bar>
			</div>
		)
	}
}
