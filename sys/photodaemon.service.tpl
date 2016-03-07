[Unit]
Description=Photodaemon webservice
After=network.target

[Service]
WorkingDirectory=WORKINGDIR
ExecStart=/usr/bin/python WORKINGDIR/photodaemon.py
User=ajnasz

[Install]
WantedBy=multi-user.target
