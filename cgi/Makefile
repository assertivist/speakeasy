CFLAGS=-g -Wall
CC=gcc
AR=ar
RANLIB=ranlib
LIBS=-L./ -lcgic 
MYSQL=`/opt/local/lib/mysql5/bin/mysql_config --cflags --libs --include`

all: libcgic.a mafia.cgi

install: mafia.cgi
	@echo haha, just put mafia.cgi wherever

libcgic.a: cgic.o cgic.h
	rm -f libcgic.a
	$(AR) rc libcgic.a cgic.o
	$(RANLIB) libcgic.a

mafia.cgi: mafia.o libcgic.a 
	gcc -g -Wall ${MYSQL} cJSON.c mafia.o -o mafia.cgi ${LIBS}

#cgictest.cgi: cgictest.o libcgic.a
#	gcc cgictest.o -o cgictest.cgi ${LIBS}

#capture: capture.o libcgic.a
#	gcc capture.o -o capture ${LIBS}

clean:
	rm -f *.o *.a mafia.cgi 

