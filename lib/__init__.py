import redis
import json
import time

class DHTStorage():
	def __init__(self, key, host='localhost', port=6379, db=0):
		self.redis = redis.StrictRedis(host=host, port=port, db=0)
		self.key = key

	def get_key(self, name):
		return "%s:%s" % (self.key, name)

	def send(self, name, data):
		pushData = {'time': time.time(), 'value': data}
		self.redis.lpush(self.get_key(name), json.dumps(pushData))

	def add_humidity(self, value):
		self.send('humidity', value)
		self.remove_old('humidity')
		# self.remove_invalids('humidity')

	def add_temperature(self, value):
		self.send('temperature', value)
		self.remove_old('temperature')
		# self.remove_invalids('temperature')

	def get_data(self, name, start=0, end=200):
		return self.redis.lrange(name, start, end)

	def get_temperature(self, start=0, end=200):
		return self.get_data(self.get_key('temperature'), start, end)

	def get_humidity(self, start=0, end=200):
		return self.get_data(self.get_key('humidity'), start, end)

	def remove_old(self, name, len=100000):
		self.redis.ltrim(self.get_key(name), 0, len)

	def remove_invalids(self, name):
		step = 100
		last = self.redis.llen(name)

		while last > 0:
			if last < step:
				start = 0
			else:
				start = last - step

			item_list = self.get_data(name, start, last)

			for a in item_list:
				item = json.loads(a)
				if float(item['value']) > 150:
					print a
					last = last + self.redis.lrem(name, 0, a)

			last = last - step


class Photo():
	def __init__(self):
		self.redis = redis.StrictRedis(host='localhost', port=6379, db=0)

	def subscribe(self):
		self.pubsub = self.redis.pubsub()
		self.pubsub.subscribe('photo')

	def take_photo(self):
		self.redis.publish('take-photo', time.time())
