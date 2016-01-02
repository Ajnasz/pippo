/*global $, Highcharts*/

(function () {
	'use strict';

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

	var setting = {
		get from () {
			return +$('#InputFrom').val();
		},

		get to() {
			return +$('#InputTo').val();
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

	function setVal(data) {
		var temp = fixValue(+data.temperatures[0].value),
			hum = fixValue(+data.humiditys[0].value);

		$(temperatureGaugeContainer).highcharts().series[0].points[0].update(temp);
		$(humidityGaugeContainer).highcharts().series[0].points[0].update(hum);
		updateTitle(temp, hum);
	}

	function updateChart(data) {
		$(temperatureContainer).highcharts().series[0].setData(transformData(data.temperatures));
		$(humidityContainer).highcharts().series[0].setData(transformData(data.humiditys));
	}

	function getCurrentValues() {
		return $.get('/data/0/0');
	}

	var getData = (function () {
		var timer;

		return function getData() {

			$.get('/data/' + setting.from + '/' + setting.to)
			.then(function (data) {
				updateChart(data);

				return getCurrentValues();

			})
			.then(function (data) {
				setVal(data);

				if (timer) {
					clearTimeout(timer);
				}

				timer = setTimeout(getData, 60000);
			});

		};
	}());

	function createTemperatureGauge() {
		var color = ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black');

		$(temperatureGaugeContainer).highcharts(Highcharts.merge(gaugeOptions, {
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

		}));
	}

	function createHumidityGauge() {
		var color = ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black');

		$(humidityGaugeContainer).highcharts(Highcharts.merge(gaugeOptions, {
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

		}));
	}

	var lineChartConf = {
		chart: {
			backgroundColor: bgColor,
			type: 'line'
		},
		title: false,
		xAxis: {
			type: 'datetime'
		}
	};

	var updateTitle = (function () {
		var lastUpdate = 0;

		return function updateTitle(temp, hum) {
			if (!document.hidden || Date.now() - lastUpdate > duration.MINUTE * 15) {
				$('title').text(`${temp}${celsius}, ${hum}% - Temperature / Humidity`);
				lastUpdate = Date.now();
			}
		};

	}());

	function createTemperatureChart() {
		$(temperatureContainer).highcharts(Highcharts.merge(lineChartConf, {
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
		}));
	}

	function createHumidityChart() {
		$(humidityContainer).highcharts(Highcharts.merge(lineChartConf, {

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
		}));
	}

	$(document).ready(function () {

		createTemperatureChart();
		createHumidityChart();
		createTemperatureGauge();
		createHumidityGauge();
		$('#Setting').on('submit', function (e) {
			e.preventDefault();
			getData();
		});

		$('#Reset').on('mouseup', function () {
			setTimeout(getData);
		});

		getData();
	});

}());
