<!DOCTYPE html>
<html>
	<head>
		<title>Temperature and Humidity</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link rel="stylesheet" type="text/css" href="/static/fonts.css">
		<link rel="stylesheet" type="text/css" href="/static/style.css">
		<link rel="icon" href="/static/pippo.png">
		<script src="https://code.highcharts.com/highcharts.js"></script>
		<script src="https://code.highcharts.com/highcharts-more.js"></script>
		<script src="https://code.highcharts.com/modules/solid-gauge.js"></script>
		<script src="/static/dark-unica.js"></script>
		<script src="/static/index.js"></script>
	</head>
	<body>
		<header id="Head" class="clr row">
			<h1 class="col col-30">Pippo</h1>
			<div class="col col-70" id="Controls">
				<div id="PhotoControls" class="col">
					<button type="button" id="TakePhoto" data-icon="" class="icon_camera_alt"></button>
					<button type="button" id="ShowPhoto" data-icon="" class="icon_image"></button>
				</div>
				<form id="Setting" class="col">
					<div class="control-group">
						<label for="InputFrom">From</label>
						<input type="number" name="from" id="InputFrom" min="0" value="0">
					</div>
					<div class="control-group">
						<label for="InputTo">To</label>
						<input type="number" name="to" id="InputTo" min="-1" value="240">
					</div>
					<button type="submit" data-icon="" class="icon_refresh"></button>
					<button id="Reset" type="reset" data-icon="" class="icon_house"></button>
				</form>
			</div>
		</header>

		<main>
			<section class="charts">
				<div class="gauges">
					<div id="TemperatureVal" class="gauge"></div>
					<div id="HumidityVal" class="gauge"></div>
				</div>
				<div class="linecharts">
					<div id="Temperature" class="linechart"></div>
					<div id="Humidity" class="linechart"></div>
				</div>
			</section>

			<section id="Photo">
				<img src="/static/photo.jpg" alt="Photo">
			</section>
		</main>
	</body>
</html>
