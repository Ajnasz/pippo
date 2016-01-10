from gevent import monkey; monkey.patch_all()
from bottle import route, run, template, static_file, response, post, get
from bottle import GeventServer, run
from lib import DHTStorage, Photo
from gevent import sleep
import json
import time

with open('config.json') as data_file:
	config = json.load(data_file)

client_key = config['key']

photo = Photo()

@get('/')
def index():
    return template('index')

@get('/data/<start>/<end>')
def data(start, end):
    d = DHTStorage(client_key)
    return {
            'humiditys': map(json.loads, d.get_humidity(start, end)),
            'temperatures': map(json.loads, d.get_temperature(start, end)),
    }

@get('/static/<path:path>')
def static(path):
    return static_file(path, root='./static')

@post('/take-photo')
def take_photo():
    photo.take_photo()

    return {
            'ok': True
    }

@get('/subscribe')
def subscribe():
    response.content_type  = 'text/event-stream'
    response.cache_control = 'no-cache'

    # Set client-side auto-reconnect timeout, ms.
    yield 'retry: 100\n\n'

    # Keep connection alive no more then... (s)
    end = time.time() + 100
    while time.time() < end:
        message = photo.pubsub.get_message()
        if message:
            print message
            yield 'data: %s\n\n' % json.dumps(message)

        sleep(1)

if __name__ == '__main__':
    run(server=GeventServer)
