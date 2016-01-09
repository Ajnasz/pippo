from bottle import route, run, template, static_file, response, post, get
from lib import DHTStorage, Photo
import json

with open('config.json') as data_file:
	config = json.load(data_file)

client_key = config['key']

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
    p = Photo()
    p.take_photo()

    return {
            'ok': True
    }

run(host='0.0.0.0', port=8080, debug=True)
