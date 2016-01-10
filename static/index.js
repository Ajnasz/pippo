/*global Highcharts*/

(function () {
	'use strict';

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

	const bgColor = '#333333';
	const celsius = '°C';
	const textTemperature = 'Temperature';
	const textHumidity = 'Humidity';

	const temperatureContainer = '#Temperature';
	const humidityContainer = '#Humidity';

	const temperatureGaugeContainer = '#TemperatureVal';
	const humidityGaugeContainer = '#HumidityVal';

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
			parseInt(x.time * 1000, 10),
			parseFloat(x.value)
		]).sort((a, b) => a[0] - b[0]);
	}

	function fixValue(num) {
		return Number(num.toFixed(2));
	}

	function setGaugeValue(chart, value) {
		return chart.series[0].points[0].update(value);
	}

	function setGaugeValues(data) {
		var temp = fixValue(+data.temperatures[0].value),
			hum = fixValue(+data.humiditys[0].value);

		setGaugeValue(temperatureGaugeChart, temp);
		setGaugeValue(humidityGaugeChart, hum);

		return Promise.resolve(data);
	}

	function updateCharts(data) {
		temperatureChart.series[0].setData(transformData(data.temperatures));
		humidityChart.series[0].setData(transformData(data.humiditys));

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
		var options = Highcharts.merge(gaugeOptions, {
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

		});

		return new Highcharts.Chart(getElem(temperatureGaugeContainer), options);
	}

	function createHumidityGauge() {
		var options = Highcharts.merge(gaugeOptions, {
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
			date = d.toLocaleString();

		return `${date}<br><b>${fixValue(y)}${unit}</b>`;
	}

	function createTemperatureChart() {
		var options = Highcharts.merge(lineChartConf, {
			tooltip: {
				formatter: function () {
					return getTooltip(this.x, this.y, celsius);
				}
			},
			series: [{
				name: textTemperature,
				data: []
			}]
		});

		return new Highcharts.Chart(getElem(temperatureContainer), options);
	}

	function createHumidityChart() {
		var options = Highcharts.merge(lineChartConf, {
			tooltip: {
				formatter: function () {
					return getTooltip(this.x, this.y, celsius);
				}
			},
			series: [{
				name: textHumidity,
				data: []
			}]
		});

		return new Highcharts.Chart(getElem(humidityContainer), options);
	}

	function takePhoto() {
		var init = {
			method: 'POST'
		};
		var req = new window.Request('/take-photo', init);

		return window.fetch(req);
	}

	function showPhoto() {
		updatePhotoSize();
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
			getElem('#Photo img').src = `/static/photo.jpg?${data}`;
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
