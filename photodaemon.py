import picamera
import redis
import time

def take_photo():
    camera = picamera.PiCamera()
    camera.capture('static/photo.jpg')
    camera.close()
    r.publish('photo', time.time())

r = redis.StrictRedis(host='localhost', port=6379, db=0)
p = r.pubsub()
p.subscribe('take-photo')

while True:
    message = p.get_message()
    if message:
        take_photo()

    time.sleep(0.005)
