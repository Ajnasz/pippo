/*global Highcharts*/

(function () {
	'use strict';
	const bgColor = 'rgba(0, 0, 0, 0.2)';
	const celsius = '°C';
	const textTemperature = 'Temperature';
	const textHumidity = 'Humidity';

	const temperatureContainer = '#Temperature';
	const humidityContainer = '#Humidity';

	const temperatureGaugeContainer = '#TemperatureVal';
	const humidityGaugeContainer = '#HumidityVal';

	function fillNoData(data) {
		data.forEach(function (item, index, array) {
			if (index < array.length - 1) {
				if (item[index + 1].time - item.time > 60 * 5) {
					array.splice(index, 0, {
						time: item.time + 1,
						value: null
					});
				}
			}
		});
	}

	function assign(target) {
		let args = Array.prototype.slice.call(arguments, 1);

		if (!args.length) {
			return;
		}

		let source = args.shift();

		Object.keys(source).forEach(function (key) {
			if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
				if (typeof target[key] !== 'object') {
					target[key] = {};
				}

				assign(target[key], source[key]);
			} else {
				target[key] = source[key];
			}
		});

		assign.apply(null, [target].concat(args));
	}

	var chart = {
		conf: null,
		configure: function (conf) {
			let newConf = {};

			assign(newConf, this.conf, conf);

			this.conf = newConf;
		}
		// },
		// loadData: function () {
		// }
	};

	var c3Chart = Object.create(chart);

	c3Chart.create = function (elem) {
		let conf = Object.create(this.conf);
		conf.bindto = elem;
		this.chart = c3.generate(conf);
	};

	var c3LineChart = Object.create(c3Chart);

	c3LineChart.conf = {
		color: {
			pattern: [
				'#ff9925', '#ff3925', '#f45b5b', '#7798bf', '#aaeeee',
				'#ff0066', '#eeaaee', '#55bf3b', '#df5353', '#7798bf',
				'#aaeeee'
			]
		},
		data: {
			x: 'x',
			xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
			columns: []
		},
		axis: {
			x: {
				type: 'timeseries',
				tick: {
					culling: {
						max: 5
					},
					format: '%Y-%m-%d %H:%M'
				}
			},
			y: {
				tick: {
					format: d3.format('.2f')

				}
			}
		},
		grid: {
			y: {
				show: true
			}
		},
		point: {
			show: false
		}
	};

	c3LineChart.loadData = function (data) {
		var conf = {
			columns: [
				['x'].concat(data.map((item) => new Date(Math.ceil(item.time * 1000)).toISOString())),
				['data'].concat(data.map((item) => item.value))
			]
		};

		this.chart.load(conf);
	};

	var c3GuageChart = Object.create(c3Chart);

	c3GuageChart.conf = {
		color: {
			pattern: [
				'#ff9925', '#ff3925', '#f45b5b', '#7798bf', '#aaeeee',
				'#ff0066', '#eeaaee', '#55bf3b', '#df5353', '#7798bf',
				'#aaeeee'
			]
		},
		data: {
			type: 'gauge',
			columns: [
				['data', 0]
			]
		},
		gauge: {
			label: {
				format: d3.format('.2f'),
			},
			min: 10,
		},
		size: {
			height: 180
		}
	};

	c3GuageChart.loadData = function (data) {
		this.chart.load({
			columns: [
				['data', data[0].value]
			]
		});
	};

	var highCharts = Object.create(chart);

	highCharts.create = function (elem) {
		let conf = {};
		assign(conf, this.conf);

		this.chart = new Highcharts.Chart(elem, conf);
	};

	var highChartsLine = Object.create(highCharts);

	highChartsLine.conf = {
		credits: {
			enabled: false
		},

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

	highChartsLine.loadData = function (data) {
		let transformed = transformData(data);

		this.chart.series[0].setData(transformed);
	};

	var highChartsGauge = Object.create(highCharts);

	highChartsGauge.conf = {
		credits: {
			enabled: false
		},

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
				[0.1, '#FF9925'],
				[0.5, '#FF8425'],
				[0.9, '#FF3925']
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

	highChartsGauge.loadData = function (data) {
		this.chart.series[0].points[0].update(fixValue(data[0].value));
	};


	/* DOM utilities */
	function getElem(selector) {
		return document.querySelector(selector);
	}

	function on(elem, event, cb) {
		elem.addEventListener(event, cb);
	}

	function setTextContent(elem, value) {
		while (elem.firstChild) {
			elem.removeChild(elem.firstChild);
		}

		elem.appendChild(document.createTextNode(value));
	}

	/* DOM utilities end */

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

	var temperatureChart, humidityChart;
	var temperatureGaugeChart, humidityGaugeChart;

	var setting = {
		get from() {
			return Number(getElem('#InputFrom').value);
		},

		get to() {
			return Number(getElem('#InputTo').value);
		}
	};

	function transformData(data) {
		fillNoData(data);
		return data.map(x => [
			parseInt(x.time * 1000, 10),
			parseFloat(x.value)
		]).sort((a, b) => a[0] - b[0]);
	}

	function fixValue(num) {
		return Number(num.toFixed(2));
	}

	function setGaugeValue(chart, data) {
		chart.loadData(data);
		// return chart.series[0].points[0].update(value);
	}

	function setGaugeValues(data) {
		setGaugeValue(temperatureGaugeChart, data.temperatures);
		setGaugeValue(humidityGaugeChart, data.humiditys);

		return Promise.resolve(data);
	}

	function updateChart(chart, data) {
		chart.loadData(data);
		// chart.series[0].setData(transformData(data));
	}

	function updateCharts(data) {
		updateChart(temperatureChart, data.temperatures);
		updateChart(humidityChart, data.humiditys);

		return Promise.resolve(data);
	}

	function getCurrentValues() {
		return window.fetch('/data/0/0');
	}

	function getHistoryValues(from, to) {
		return window.fetch(`/data/${from}/${to}`);
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
			getHistoryValues(setting.from, setting.to)
				.then(responseToJSON)
				.then(updateCharts)
				.then(getCurrentValues)
				.then(responseToJSON)
				.then(setGaugeValues)
				.then(updateTitle)
				.then(schedule);

		};
	}());

	function getDataLabelFormat(unit) {
		return `<div class="gauge-data-label">` +
			`<span class="gauge-data-label-value">{y}</span>` +
			`<span class="gauge-data-label-unit">${unit}</span></div>`;
	}

	function createTemperatureGauge() {
		return createC3GaugeChart(getElem(temperatureGaugeContainer), {
			data: {
				names: {
					data: textTemperature
				}
			},
			gauge: {
				units: celsius,
				max: 50,
			},
			tooltip: {
				format: {
					value: function (value) {
						return fixValue(value) + celsius;
					}
				}
			}
		});


		/*
		return createHighChartsGaugeChart({
			yAxis: {
				min: 10,
				max: 50,
				title: {
					text: textTemperature
				}
			},

			series: [{
				data: [0],
				dataLabels: {
					format: getDataLabelFormat(celsius)
				}
			}]

		}, getElem(temperatureGaugeContainer));
		*/
	}

	function createHumidityGauge() {
		return createC3GaugeChart(getElem(humidityGaugeContainer), {
			data: {
				names: {
					data: textHumidity
				}
			},
			gauge: {
				units: '%',
				max: 100,
			},
			tooltip: {
				format: {
					value: function (value) {
						return fixValue(value) + '%';
					}
				}
			}

		});

		/*
		return createHighChartsGaugeChart({
			yAxis: {
				min: 0,
				max: 100,
				title: {
					text: textHumidity
				}
			},

			series: [{
				data: [0],
				dataLabels: {
					format: getDataLabelFormat('%')
				}
			}]

		}, getElem(humidityGaugeContainer));
		*/
	}

	var updateTitle = (function () {
		var lastUpdate = 0;

		function canUpdate() {
			return !document.hidden || Date.now() - lastUpdate > duration.MINUTE * 15;
		}

		return function updateTitle(data) {
			var temp = fixValue(+data.temperatures[0].value),
				hum = fixValue(+data.humiditys[0].value);

			if (canUpdate()) {
				setTextContent(getElem('title'),  `${temp}${celsius}, ${hum}% - ${textTemperature} / ${textHumidity}`);
				lastUpdate = Date.now();
			}

			return Promise.resolve(data);
		};

	}());

	function getTooltip(x, y, unit) {
		var d = new Date(x),
			// date = d.toLocaleString();
			date =  d.toString();

		return `${date}<br><b>${fixValue(y)}${unit}</b>`;
	}

	function createChart(base, userConf, elem) {
		var chart = Object.create(base);

		chart.configure(userConf);
		chart.create(elem);

		return chart;
	}

	function createC3Chart(userConf, elem) {
		return createChart(c3LineChart, userConf, elem);
	}

	function createC3GaugeChart(elem, userConf) {
		return createChart(c3GuageChart, userConf, elem);
	}

	function createHighChartsChart(userConf, elem) {
		return createChart(highChartsLine, userConf, elem);
	}

	function createHighChartsGaugeChart(userConf, elem) {
		return createChart(highChartsGauge, userConf, elem);
	}

	function createTemperatureChart() {
		return createC3Chart({
			data: {
				names: {
					data: textTemperature
				}
			},
			tooltip: {
				format: {
					value: function (value) {
						return fixValue(value) + celsius;
					}

				}
			}
		}, temperatureContainer);

	   /*
		return createHighChartsChart({
			tooltip: {
				formatter: function () {
					return getTooltip(this.x, this.y, celsius);
				}
			},
			series: [{
				name: textTemperature,
				data: []
			}]
		}, getElem(temperatureContainer));
		*/
	}

	function createHumidityChart() {
		return createC3Chart({
			data: {
				names: {
					data: textHumidity
				}
			},
			tooltip: {
				format: {
					value: function (value) {
						return fixValue(value) + '%';
					}

				}
			}
		}, humidityContainer);

		/*
		return createHighChartsChart({
			tooltip: {
				formatter: function () {
					return getTooltip(this.x, this.y, '%');
				}
			},
			series: [{
				name: textHumidity,
				data: []
			}]
		}, getElem(humidityContainer));
		*/
	}

	function takePhoto() {
		var init = {
			method: 'POST'
		};
		var req = new window.Request('/take-photo', init);

		return window.fetch(req);
	}

	function showPhoto() {
		// updatePhotoSize();
		getElem('#Photo').classList.add('visible');
	}

	function updatePhotoSize() {
		getElem('#Photo').style.width = window.innerWidth + 'px';
		getElem('#Photo').style.height = window.innerHeight + 'px';
	}

	function hidePhoto() {
		getElem('#Photo').classList.remove('visible');
	}

	function updatePhoto(msg) {
		var data = JSON.parse(msg.data);

		if (data.data) {
			getElem('#Photo img').src = `/static/photo.jpg?${data.data}`;
		}
	}
	on(document, 'DOMContentLoaded', function () {

		temperatureChart = createTemperatureChart();
		humidityChart = createHumidityChart();
		temperatureGaugeChart = createTemperatureGauge();
		humidityGaugeChart = createHumidityGauge();

		on(getElem('#Setting'), 'submit', function (e) {
			e.preventDefault();
			getData();
		});

		on(getElem('#Reset'), 'mouseup', function () {
			setTimeout(getData);
		});

		on(getElem('#TakePhoto'), 'click', takePhoto);
		on(getElem('#ShowPhoto'), 'click', showPhoto);
		on(getElem('#Photo'), 'click', hidePhoto);
		on(window, 'resize', updatePhotoSize);

		var visibilitychangeTimer = 0;

		on(document, 'visibilitychange', function () {
			if (visibilitychangeTimer) {
				clearTimeout(visibilitychangeTimer);
			}

			if (!document.hidden) {
				visibilitychangeTimer = setTimeout(getData, 2000);
			}
		});

		var e = new window.EventSource('/subscribe');

		e.onmessage = updatePhoto;

		getData();
	});

}());
