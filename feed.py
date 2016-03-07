#!/usr/bin/env python

import sys
import os
import Adafruit_DHT
import Adafruit_IO
import json
import requests
from lib import DHTStorage


PIDFILE = "/tmp/pippo.pid"

class PippoLockedError(Exception):
	def __init__(self):
		self.msg = "Pippo locked"

class PippoNotLockedError(Exception):
	def __init__(self):
		self.msg = "Pippo not locked"

def send(client, humidity, temperature):
	client.send('humidity', '{0:0.3f}'.format(humidity))
	client.send('temperature',  '{0:0.3f}'.format(temperature))

def toadaio(client_key, humidity, temperature):
	try:
		aio = Adafruit_IO.Client(client_key)
		send(aio, humidity, temperature)
	except Adafruit_IO.errors.RequestError:
		pass
	except requests.exceptions.ConnectionError:
		pass
	except Adafruit_IO.errors.ThrottlingError:
		pass

def todhtstorage(config, humidity, temperature):
	storage = DHTStorage(key=config['key'], host=config['host'], port=config['port'], db=config['db'])

	storage.add_temperature(temperature)
	storage.add_humidity(humidity)

def lock():
	if islocked():
		raise PippoLockedError()

	pid = str(os.getpid())
	file(PIDFILE, "w").write(pid)

def unlock():
	if not islocked():
		raise PippoNotLockedError()

	os.unlink(PIDFILE)

def islocked():
	return os.path.isfile(PIDFILE)

def main():
	try:
		lock()
		# Parse command line parameters.
		sensor_args = { '11': Adafruit_DHT.DHT11,
						'22': Adafruit_DHT.DHT22,
						'2302': Adafruit_DHT.AM2302 }
		if len(sys.argv) == 3 and sys.argv[1] in sensor_args:
			sensor = sensor_args[sys.argv[1]]
			pin = sys.argv[2]
		else:
			print 'usage: sudo ./Adafruit_DHT.py [11|22|2302] GPIOpin#'
			print 'example: sudo ./Adafruit_DHT.py 2302 4 - Read from an AM2302 connected to GPIO #4'
			sys.exit(1)

		# Try to grab a sensor reading.  Use the read_retry method which will retry up
		# to 15 times to get a sensor reading (waiting 2 seconds between each retry).
		humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)

		# Un-comment the line below to convert the temperature to Fahrenheit.
		# temperature = temperature * 9/5.0 + 32

		# Note that sometimes you won't get a reading and
		# the results will be null (because Linux can't
		# guarantee the timing of calls to read the sensor).
		# If this happens try again!

		if humidity is not None and temperature is not None:

			with open(os.path.join(os.path.dirname(__file__), 'config.json')) as data_file:
				config = json.load(data_file)

			client_key = config['key']
			todhtstorage(client_key, humidity, temperature)
			toadaio(client_key, humidity, temperature)
			# print 'Temp={0:0.1f}*  Humidity={1:0.1f}%'.format(temperature, humidity)
		else:
			print 'Failed to get reading. Try again!'
			sys.exit(1)
		unlock()
	except PippoLockedError:
		print "Unexpected error:", sys.exc_info()[0]
	except:
		unlock()



main()
# vim: set ts=4 sw=4 noet
