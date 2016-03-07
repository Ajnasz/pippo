#!/bin/sh

SCRIPT=$(readlink -f "$0")
BASEDIR=$(dirname "$(dirname "$SCRIPT")")

sed -s "s!WORKINGDIR!$BASEDIR!" photodaemon.service.tpl > photodaemon.service
sed -s "s!WORKINGDIR!$BASEDIR!" pippo.service.tpl > pippo.service
