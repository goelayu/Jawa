#!/bin/bash

# http://web.archive.org/__wb/calendarcaptures/2?url=http://web.archive.org/screenshot/http://www.cnn.com&date=2020

QUERY='date=202011&output=json' node crawlWayBack.js -u $1 -o $2 -m $3 -p $4
# QUERY='from=2020&output=json&limit=1&filter=mimetype:text/html&filter=statuscode:200' node crawlWayBack.js -u $1 -o $2
# QUERY='matchType=prefix&from=201909&output=json&limit=1&filter=mimetype:text/html&filter=statuscode:200' node crawlWayBack.js -u $1 -o $2
# QUERY='matchType=prefix&from=201908&output=json&limit=1&filter=mimetype:text/html&filter=statuscode:200' node crawlWayBack.js -u $1 -o $2
# QUERY='matchType=prefix&from=201907&output=json&limit=1&filter=mimetype:text/html&filter=statuscode:200' node crawlWayBack.js -u $1 -o $2