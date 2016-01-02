# Pippo

Send temperature and humidity stats into io.adafruit.com and into your local redis server and provides an interface to view your stats.

## Setup

* Install redis, python-bottle for the webserver.
* Install Adafruit_DHT and Adafruit_IO python packages.
* Open config.json and set the key to your adafruit.io key. (The same key will be used as a namespace in your local redis server)

## Setup a cronjob

```sh
$ sudo crontab -e
```

Put the following line into the crontab. This will add a new entry in every minute.

```cron
* * * * * /path/to/pippo/feed.py 2302 4
```

# Start webserver

```sh
$ cd /path/to/pippo
$ python index.py
```
