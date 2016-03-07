import picamera
import redis
import time
import json
import os

with open(os.path.join(os.path.dirname(__file__), 'config.json')) as data_file:
    config = json.load(data_file)

print config

def take_photo():
    camera = picamera.PiCamera()
    camera.resolution = (1280, 720)
    camera.hflip = True
    time.sleep(1)
    camera.capture('static/photo.jpg')
    camera.close()
    r.publish('photo', time.time())

r = redis.StrictRedis(host=config['host'], port=config['port'], db=config['db'])
p = r.pubsub()
p.subscribe('take-photo')

while True:
    message = p.get_message()
    if message:
        take_photo()

    time.sleep(0.005)
