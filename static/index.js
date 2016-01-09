/*global Highcharts*/

(function () {
	'use strict';

	function getElem(selector) {
		return document.querySelector(selector);
	}

	const duration = Object.freeze((function () {
		const sec = 1000,
			min = 60 * sec,
			hour = 60 * min,
			day = 24 * hour,
			week = 7 * day;

		return {
			SECOND: sec,
			MINUTE: min,
			HOUR: hour,
			DAY: day,
			WEEK: week
		};
	}()));

	const bgColor = '#333333';
	const celsius = '°C';

	const temperatureContainer = '#Temperature';
	const humidityContainer = '#Humidity';

	const temperatureGaugeContainer = '#TemperatureVal';
	const humidityGaugeContainer = '#HumidityVal';

	var temperatureChart, humidityChart;
	var temperatureGaugeChart, humidityGaugeChart;

	var setting = {
		get from () {
			return Number(getElem('#InputFrom').value);
		},

		get to() {
			return Number(getElem('#InputTo').value);
		}
	};

	var gaugeOptions = {

		chart: {
			backgroundColor: bgColor,
			type: 'solidgauge'
		},

		title: null,

		pane: {
			center: ['50%', '85%'],
			size: '130%',
			startAngle: -90,
			endAngle: 90,
			background: {
				backgroundColor: bgColor,
				innerRadius: '60%',
				outerRadius: '100%',
				shape: 'arc'
			}
		},

		tooltip: {
			enabled: false
		},

		// the value axis
		yAxis: {
			stops: [
				[0.1, '#55BF3B'], // green
				[0.5, '#DDDF0D'], // yellow
				[0.9, '#DF5353'] // red
			],
			lineWidth: 0,
			minorTickInterval: null,
			tickPixelInterval: 400,
			tickWidth: 0,
			title: {
				y: -70
			},
			labels: {
				y: 16
			}
		},

		plotOptions: {
			solidgauge: {
				dataLabels: {
					y: 5,
					borderWidth: 0,
					useHTML: true
				}
			}
		}
	};

	function transformData(data) {
		return data.map(x => [
			parseInt(x.time * 1000),
			parseFloat(x.value)
		]).sort((a, b) => a[0] - b[0]);
	}

	function fixValue(num) {
		return Math.round(num * 100) / 100;
	}

	function setGaugeValues(data) {
		var temp = fixValue(+data.temperatures[0].value),
			hum = fixValue(+data.humiditys[0].value);

		temperatureGaugeChart.series[0].points[0].update(temp);
		humidityGaugeChart.series[0].points[0].update(hum);
		updateTitle(temp, hum);

		return Promise.resolve(data);
	}

	function updateChart(data) {
		temperatureChart.series[0].setData(transformData(data.temperatures));
		humidityChart.series[0].setData(transformData(data.humiditys));

		return Promise.resolve(data);
	}

	function getCurrentValues() {
		return window.fetch('/data/0/0');
	}

	function responseToJSON(response) {
		return Promise.resolve(response.json());
	}

	var getData = (function () {
		var timer;

		function schedule() {
			if (timer) {
				clearTimeout(timer);
			}

			timer = setTimeout(getData, 60000);
		}

		return function getData() {

			window.fetch('/data/' + setting.from + '/' + setting.to)
				.then(responseToJSON)
				.then(updateChart)
				.then(getCurrentValues)
				.then(responseToJSON)
				.then(setGaugeValues)
				.then(schedule);

		};
	}());

	function createTemperatureGauge() {
		var color = ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black');
		var options = Highcharts.merge(gaugeOptions, {
			yAxis: {
				min: 10,
				max: 50,
				title: {
					text: 'Temperature'
				}
			},

			series: [{
				data: [0],
				dataLabels: {
					format: `<div style="text-align:center">` +
						`<span style="font-size:1.5rem;color:${color}">{y}</span>` +
						`<br/>` +
						`<span style="font-size:1rem;color:silver">${celsius}</span></div>`
				}
			}]

		});

		return new Highcharts.Chart(getElem(temperatureGaugeContainer), options);
	}

	function createHumidityGauge() {
		var color = ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black');

		var options = Highcharts.merge(gaugeOptions, {
			yAxis: {
				min: 0,
				max: 100,
				title: {
					text: 'Humidity'
				}
			},

			series: [{
				data: [0],
				dataLabels: {
					format: `<div style="text-align:center">` +
						`<span style="font-size:1.5rem;color:${color}">{y}</span>` +
						`<br/>` +
						`<span style="font-size:1rem;color:silver">%</span></div>`
				}
			}]

		});

		return new Highcharts.Chart(getElem(humidityGaugeContainer), options);
	}

	var lineChartConf = {
		chart: {
			backgroundColor: bgColor,
			type: 'line'
		},
		title: false,
		xAxis: {
			type: 'datetime',
			labels: {
				formatter: function () {
					return (new Date(this.value)).toLocaleTimeString();
				}
			}
		}
	};

	var updateTitle = (function () {
		var lastUpdate = 0;

		return function updateTitle(temp, hum) {
			if (!document.hidden || Date.now() - lastUpdate > duration.MINUTE * 15) {
				getElem('title').textContent = `${temp}${celsius}, ${hum}% - Temperature / Humidity`;
				lastUpdate = Date.now();
			}
		};

	}());

	function createTemperatureChart() {
		var options = Highcharts.merge(lineChartConf, {
			tooltip: {
				formatter: function () {
					var d = new Date(this.x),
						date = d.toLocaleString(),
						y = fixValue(this.y);

					return `${date}<br><b>${y}${celsius}</b>`;
				}
			},
			series: [{
				name: 'Temperature',
				data: []
			}]
		});

		return new Highcharts.Chart(getElem(temperatureContainer), options);
	}

	function createHumidityChart() {
		var options = Highcharts.merge(lineChartConf, {
			tooltip: {
				formatter: function () {
					var d = new Date(this.x),
						date = d.toLocaleString(),
						y = fixValue(this.y);

					return `${date}<br><b>${y}%</b>`;
				}
			},
			series: [{
				name: 'Humidity',
				data: []
			}]
		});

		return new Highcharts.Chart(getElem(humidityContainer), options);
	}

	document.addEventListener('DOMContentLoaded', function () {

		temperatureChart = createTemperatureChart();
		humidityChart = createHumidityChart();
		temperatureGaugeChart = createTemperatureGauge();
		humidityGaugeChart = createHumidityGauge();

		getElem('#Setting').addEventListener('submit', function (e) {
			e.preventDefault();
			getData();
		});

		getElem('#Reset').addEventListener('mouseup', function () {
			setTimeout(getData);
		});

		var visibilitychangeTimer = 0;

		document.addEventListener('visibilitychange', function () {
			if (visibilitychangeTimer) {
				clearTimeout(visibilitychangeTimer);
			}

			if (!document.hidden) {
				visibilitychangeTimer = setTimeout(getData, 2000);
			}
		});

		getData();
	});

}());
