#!/bin/env python

import picamera
import redis
import time
import json
import os

def take_photo():
    print "%s Capture photo" % (time.strftime('%Y.%m.%d %H:%M:%S %Z'))
    camera = picamera.PiCamera()
    camera.vflip = True
    camera.resolution = (1280, 720)
    time.sleep(1)
    camera.capture('static/photo.jpg')
    camera.close()
    r.publish('photo', time.time())
    print "%s Capture done" % (time.strftime('%Y.%m.%d %H:%M:%S %Z'))

def get_config():
    with open(os.path.join(os.path.dirname(__file__), 'config.json')) as data_file:
        return json.load(data_file)

def main():
    config = get_config()

    r = redis.StrictRedis(host=config['host'], port=config['port'], db=config['db'])
    p = r.pubsub()
    p.subscribe('take-photo')

    while True:
        message = p.get_message()
        if message and message['type'] == 'message':
            take_photo()

        time.sleep(0.1)

if __name__ == '__main__':
    main()
