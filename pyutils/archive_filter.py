
# This script filters out javascript files
# which are irrelevant for an archival page

import argparse
from pyutils.mahimahi import Mahimahi
import os
import re
import json

def read_filter():
    path='filter-lists/archive-filter.txt'
    with open(path,'rb') as f:
        filters = f.readlines()
    return strip_list(filters)

def strip_list(l):
    r = []
    for i in l:
        r.append(i.strip())
    return r

def get_disk_filename(s):
    if len(s) > 50:
        filename = s[-50:]

    s = str(s).strip().replace(' ', '_')
    return re.sub(r'(?u)[^-\w.]', '', s)

def is_adblocked_url(url, adb_file):
    adb_urls = json.loads(open(adb_file,'rb').read())
    disk_url = get_disk_filename(url)
    if disk_url in adb_urls:
        return True
    return False

def main(args):
    filters = read_filter()
    filter_size = 0
    total_size = 0
    adb_size = 0
    for root, folder, files in os.walk(args.original):
        for file in files:
            try:
                mm = Mahimahi(os.path.join(root,file))
                type = mm.getHeader('content-type')
                if 'javascript' not in type or not mm.isCriticalFile() or mm.getStatus() != '200':
                    continue
                url = mm.getUrl()
                fullurl = "{}/{}".format(mm.getRequestHeader('host'),mm.getUrl())
                file_size = len(mm._plainText)
                filtered_url = False
                for rule in filters:
                    if rule in url:
                        filtered_url = True
                
                if is_adblocked_url(url, args.adblock):
                    print "Adblock:", url
                    adb_size += file_size
                elif filtered_url:
                    print "archive-filter:", url
                    filter_size += file_size
                
                total_size += file_size
            except:
                pass
    print "Res:", total_size, filter_size, adb_size

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('original', help='path to input directory')
    parser.add_argument('adblock', help='path to adblocked urls')
    args = parser.parse_args()
    main(args)