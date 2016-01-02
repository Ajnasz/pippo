from bottle import route, run, template, static_file, response
from lib import DHTStorage
import json

with open('config.json') as data_file:
	config = json.load(data_file)

client_key = config['key']

@route('/')
def index():
    return template('index')

@route('/data/<start>/<end>')
def data(start, end):
    d = DHTStorage(client_key)
    return {
            'humiditys': map(json.loads, d.get_humidity(start, end)),
            'temperatures': map(json.loads, d.get_temperature(start, end)),
    }

@route('/static/<path:path>')
def static(path):
    return static_file(path, root='./static')

run(host='0.0.0.0', port=8080, debug=True)
