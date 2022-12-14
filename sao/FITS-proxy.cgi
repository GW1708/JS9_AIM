#!/bin/bash

# site configuration
if [ -f ./js9config.cgi ]; then
  . ./js9config.cgi
fi

# we need wget or curl to retrieve the image
hash wget 1>/dev/null 2>&1
if [ $? = 0 ]; then
  URLGET="wget"
  URLGETARGS="-O- -q --save-headers"
else
  hash curl 1>/dev/null 2>&1
  if [ $? = 0 ]; then
    URLGET="curl"
    URLGETARGS="-i -s"
  else
    exit 1
  fi
fi

# allow query to be passed on command line for debugging
if [ "$QUERY_STRING" = "" ] ; then
    QUERY_STRING="$1"
fi

# get url
url=${QUERY_STRING#fits=}
# remove filter brackets, if present
url=${url%%[*}

# sanity check for FITS file
FILE="${url##*/}"
FILE="${FILE%%\?*}"
EXT1="${FILE##*.}"

case "$EXT1" in
    "fits"|"ftz"|"fz")
        ;;
    "gz"|"bz2")
        EXT2="${FILE#*.}"
        case "$EXT2" in
            "fits.gz"|"fits.bz2")
                ;;
            *)
                exit 1
                ;;
        esac
        ;;
    *)  exit 1
        ;;
esac

# retrieve data and send back CORS header with the data
$URLGET $URLGETARGS $url | (
 while read LINE; do
    case "$LINE" in
	""|"")
	    echo "Access-Control-Allow-Origin: *"
	    echo
	    cat
	    exit 0
	    ;;
	[Cc]ontent-[Ee]ncoding*)
	    case $LINE in
		*gzip*)
		    echo "Content-Encoding: gzip"
		    Encoding=1
		    ;;
	    esac
	    ;;
	[Cc]ontent-[Tt]ype*)
	    case $LINE in
		*gfits*)
		    if [ "$Encoding" = "" ] ; then 
			echo "Content-Encoding: gzip"
		    fi
		    ;;
	    esac
	    echo $LINE
	    ;;
    esac
 done
)
