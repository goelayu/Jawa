# This script is the python
# version of the nodejs script: adblock-engine.js
# in the utils directory. 
# Basically compares how different adblockers work 

import argparse
import os
import re
import json
import hashlib
from adblockparser import AdblockRules

DIR = os.path.dirname(os.path.abspath(__file__))
filter_list = "{}/../filter-lists/combined.txt".format(DIR)

def get_custom_filter():
    path="{}/../filter-lists/archive-filter.txt".format(DIR)
    with open(path,'rb') as f:
        filters = f.readlines()
    return strip_list(filters)

def get_tracker_filter():
    with open(filter_list,'rb') as f:
        raw_rules = f.read().decode('utf8').splitlines()
    rules = AdblockRules(raw_rules,use_re2=True, max_mem=1*1024*1024*1024)
    return rules

def strip_list(l):
    r = []
    for i in l:
        r.append(i.strip())
    return r

def get_disk_filename(s):
    orig = s
    s = re.sub('\/web\/\d{14}','',s)
    if len(s) > 50:
        s = s[-50:]

    s = str(s).strip().replace(' ', '_')
    s = str(s).strip().replace(' ', '_')
    s =  re.sub(r'(?u)[^-\w.]', '_', s)
    return s + '-hash-' + hashlib.md5(orig).hexdigest()

def is_adblocked_url(url, adb_file):
    adb_urls = json.loads(open(adb_file,'rb').read())
    disk_url = get_disk_filename(url)
    if disk_url in adb_urls:
        return True
    return False

def main(args):
    custom_filter = get_custom_filter()
    tracker_filter = get_tracker_filter()
    print 'Filter initialized'
    unfiltered = []
    urls = open(args.urls,'r').readlines()
    for idx, url in enumerate(urls):
        # print "Processing {}/{}".format(idx, len(urls))
        if url == '':
            continue
        if not tracker_filter.should_block(url,options={'third-party':True}):
            unfiltered.append(url)
    print json.dumps(unfiltered)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('urls', help='list of urls')
    args = parser.parse_args()
    main(args)