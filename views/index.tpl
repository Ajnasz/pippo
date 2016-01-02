<!DOCTYPE html>
<html>
	<head>
		<title>Temperature and Humidity</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="/static/style.css">
		<link rel="icon" href="/static/pippo.png">
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
		<script src="https://code.highcharts.com/highcharts.js"></script>
		<script src="https://code.highcharts.com/highcharts-more.js"></script>
		<script src="https://code.highcharts.com/modules/solid-gauge.js"></script>
		<script src="/static/dark-unica.js"></script>
		<script src="/static/index.js"></script>
	</head>
	<body>
		<header id="Head">
			<h1>Pippo</h1>
			<form id="Setting" class="inline-form">
				<div class="control-group">
					<label for="InputFrom">From</label>
					<input type="number" name="from" id="InputFrom" min="0" value="0">
				</div>
				<div class="control-group">
					<label for="InputTo">To</label>
					<input type="number" name="to" id="InputTo" min="-1" value="120">
				</div>
				<button type="submit">Update</button>
				<button id="Reset" type="reset">Reset</button>
			</form>
		</header>
		<div class="charts">
			<div class="gauges">
				<div id="TemperatureVal" class="gauge"></div>
				<div id="HumidityVal" class="gauge"></div>
			</div>
			<div class="linecharts">
				<div id="Temperature" class="linechart"></div>
				<div id="Humidity" class="linechart"></div>
			</div>
		</div>
	</body>
</html>
