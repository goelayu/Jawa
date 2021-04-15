
# This script filters out javascript files
# which are irrelevant for an archival page

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
    rules = AdblockRules(raw_rules,use_re2=True, max_mem=512*1024*1024)
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

    paths = open(args.paths,'r').readlines()
    for path in paths:
        if path == '':
            continue
        path = path.strip()
        full_path = '{}/{}'.format(args.dir, path)
        url_file = '{}/__metadata__/urls'.format(full_path)
        urls = json.loads(open(url_file,'r').read())
        filtered_file = {'tracker':[], 'custom':[]}
        for u in urls['js']:
            [full_url, upath] = u

            if tracker_filter.should_block(full_url,options={'third-party':True}):
                filename = get_disk_filename(upath)
                filtered_file['tracker'].append(filename)
            else:
                for rule in custom_filter:
                    if rule in full_url:
                        filename = get_disk_filename(upath)
                        filtered_file['custom'].append(filename) 

        out_file = '{}/__metadata__/filtered'.format(full_path)
        open(out_file,'w').write(json.dumps(filtered_file))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('dir',help='path to data dir')
    parser.add_argument('paths', help='list of paths')
    args = parser.parse_args()
    main(args)