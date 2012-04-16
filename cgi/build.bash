#!/bin/bash
gcc -Wall `/opt/local/lib/mysql5/bin/mysql_config --cflags --libs --include` -o mafia mafia.c 
