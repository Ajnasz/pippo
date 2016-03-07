[Unit]
Description=Pippo webservice
After=network.target
    
[Service]
WorkingDirectory=WORKINGDIR
ExecStart=/usr/bin/python WORKINGDIR/index.py
User=ajnasz
    
[Install]
WantedBy=multi-user.target
