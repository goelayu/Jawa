import sys
sys.path = [p for p in sys.path if 'vault' not in p]
# for p in sys.path:
#     if '/vault-home/goelayu/.local/' in p:
#         print 'removing',p
#         sys.path.remove(p)
#         # break

import brotli
import http_record_pb2
import argparse
import zlib
import os
import re
import subprocess
import sys
from copy import deepcopy
import json
import time
import hashlib
import unicodedata
import multiprocessing as mp
from functools import partial
import random
# from adblockparser import AdblockRules
# from jsonrpclib import Server
# from pyutils.mahimahi import Mahimahi

deflate_compress = zlib.compressobj(9, zlib.DEFLATED, -zlib.MAX_WBITS)
zlib_compress = zlib.compressobj(9, zlib.DEFLATED, zlib.MAX_WBITS)
gzip_compress = zlib.compressobj(9, zlib.DEFLATED, zlib.MAX_WBITS | 16)

# analyzer_script = 'instrument.js'
DIR = os.path.dirname(os.path.abspath(__file__))
analyzer_script = "{}/../program_analysis/instrument.js".format(DIR)
# filter_list = "{}/../filter-lists/combined.txt".format(DIR)
# filter_rules = None
wombat_location = '/w/goelayu/webArchive/data/wombat.js'

# mp_manager = mp.Manager()
# analytic_files = mp_manager.list()
# custom_files = mp_manager.list()

def copy(source, destination):
    subprocess.Popen("cp {} {}/".format(source, destination), shell=True)

def read_filter():
    path='../filter-lists/archive-filter.txt'
    with open(path,'rb') as f:
        filters = f.readlines()
    return strip_list(filters)

def strip_list(l):
    r = []
    for i in l:
        r.append(i.strip())
    return r

# custom_filter = read_filter()

def unchunk(body):
    new_body = ""
    # iterate through chunks until we hit the last chunk
    crlf_loc = body.find('\r\n')
    chunk_size = int( body[:crlf_loc], 16 )
    body = body[crlf_loc+2:]
    while( chunk_size != 0 ):
        # add chunk content to new body and remove from old body
        new_body += body[0:chunk_size]
        body = body[chunk_size:]

        # remove CRLF trailing chunk
        body = body[2:]

        # get chunk size
        crlf_loc = body.find('\r\n')
        chunk_size = int( body[:crlf_loc], 16 )
        body = body[crlf_loc+2:]

    # on the last chunk
    body = body[crlf_loc+2:]

    return new_body

def get_valid_filename(s):
    """
    Return the given string converted to a string that can be used for a clean
    filename. Remove leading and trailing spaces; convert other spaces to
    underscores; and remove anything that is not an alphanumeric, dash,
    underscore, or dot.
    >>> get_valid_filename("john's portrait in 2004.jpg")
    'johns_portrait_in_2004.jpg'
    """
    # return s.replace('/',';;')
    s = str(s).strip().replace(' ', '_')
    return re.sub(r'(?u)[^-\w.]', '_', s)

def get_filter_rules():
    start = time.time()
    with open(filter_list,'rb') as f:
        raw_rules = f.read().decode('utf8').splitlines()
    end = time.time()
    print 'read rules', end - start
    rules = AdblockRules(raw_rules,use_re2=True, max_mem=512*1024*1024)
    print 'created filter', time.time()-end
    return rules

def get_mm_header(mm_obj, key):
    for header in mm_obj.request.header:
        if header.key.lower() == key:
            return header.value

    return None

def _intercept_location_wombat(body):
    overrwrite_location_methods = '''
        WombatLocation.prototype.replace = function replace(url) {
            return;
        }
        ,
        WombatLocation.prototype.assign = function assign(url) {
            return;
        }
        ,
        WombatLocation.prototype.reload = function reload(forcedReload) {
            return;
        },
    '''
    location = body.index('addToStringTagToClass(Wombat')

    return body[:location] + overrwrite_location_methods + body[:location]

def intercept_location_wombat(mm_obj, TEMP_FILE, args, file):
    body = mm_obj.response.body
    TEMP_FILE_zip='{}.zip'.format(TEMP_FILE)
    print mm_obj.request.first_line
    
    is_zipped = False
    # for header in mm_obj.response.header:
    #     if header.key.lower() == "content-encoding":

    #         open(TEMP_FILE_zip,'w').write(body)
    #         zipCommand = "gzip -dc {} > {}".format(TEMP_FILE_zip, TEMP_FILE)
    #         subprocess.call(zipCommand, shell=True)
    #         body = open(TEMP_FILE,'r').read()
    #         break
    

    # if is_zipped:
    #     body = zlib.decompress(bytes(bytearray(body)), zlib.MAX_WBITS|32)
    
    # body = _intercept_location_wombat(body)

    # open(TEMP_FILE,'w').write(body)
    # TEMP_FILE_zip='{}.zip'.format(TEMP_FILE)
    # zipCommand = "gzip -c {} > {}".format(TEMP_FILE, TEMP_FILE_zip)
    # subprocess.call(zipCommand, shell=True)
    mm_obj.response.body = open(wombat_location,'r').read()
    clone_mm_obj = deepcopy(mm_obj)
    
    for key in ['content-encoding','transfer-encoding']:
        for header in mm_obj.response.header:
            if header.key.lower() == key:
                mm_obj.response.header.remove(header)
                break
    outputFile = open(os.path.join(args.output, file), "w")
    outputFile.write(mm_obj.SerializeToString())

    outputFile.close()
    subprocess.call("rm {} {}".format(TEMP_FILE, TEMP_FILE_zip),stderr=open("/dev/null","r"), shell=True)



def instrument(root, fileType,args,file_obj):
    http_response = file_obj['mm']
    file = file_obj['file']
    # f = open(os.path.join(root,file), "rb")
    # http_response = http_record_pb2.RequestResponse()
    # http_response.ParseFromString(f.read())
    # f.close()
    filename = http_response.request.first_line.split()[1]
    origPath = filename
    output_http_response = deepcopy(http_response)
    url = root.split('/')[-2]
    markedToBeDeleted = []
    gzip = False
    gzipType = ""
    iframe_script_path = "iframeJs2/"
    log_directory = args.logDir

    subprocess.call("mkdir -p {}".format(log_directory), shell=True)
    TEMP_FILE = log_directory + '/' + str(os.getpid()) + str(random.randint(0, 100000))

    fullurl = "http://{}{}".format(get_mm_header(http_response,'host'),filename)

    print "Instrumenting file {} with type {}".format(fullurl, fileType)

    if 'wombat' in fullurl:
        intercept_location_wombat(http_response, TEMP_FILE, args, file)
        return

    if fileType == 'js' and ('web.archive.org/_static/js/' in fullurl or 'archive.org/includes/' in fullurl):
        print "Skipping client-side libraries for archive.org", fullurl
        return

    # skip non critical archive urls
    # ts = re.findall(r'\d+',origPath)
    # if len(ts) == 0 or len(ts[0]) != 14:
    #     print "Skipping non critical files", fullurl
    #     copy(os.path.join(root,file), args.output)
    #     return

    #remove timestamp from filename
    filename = re.sub('\/web\/\d{14}','',filename)

    if len(filename) > 50:
        filename = filename[-50:]
    if filename == "/":
        filename = url+filename

    filename = get_valid_filename(filename) + '-hash-' + hashlib.md5(origPath).hexdigest()

    # check whether its a analytics file or not
    # if fileType == 'js' and args.filter and filter_rules.should_block(fullurl,options={'third-party':True}):
    #     print "Discovered analytics file", fullurl
    #     analytic_files.append(filename)

    # elif fileType == 'js' and args.filter:
    #     for rule in custom_filter:
    #         if rule in fullurl:
    #             print "Discovered custom filtered file", fullurl
    #             custom_files.append(filename) 
    

    node_debugging_port = random.randint(9300,9600)
    # pid = os.fork()

    # if pid == 0:
    TEMP_FILE_zip = TEMP_FILE + ".gz"
    for header in http_response.response.header:
        if header.key.lower() == "content-encoding":
            # print "GZIIPED FILE is " , file
            gzip = True
            gzipType = header.value
            # markedToBeDeleted.append(header.key)

        elif header.key.lower() == "transfer-encoding" and header.value == "chunked":
            http_response.response.body = unchunk(http_response.response.body)
            markedToBeDeleted.append(header.key)

    f = open(TEMP_FILE, "w")
    content = http_response.response.body
    orig_content = content
    if gzip:
        try:
            if gzipType.lower() != "br":
                decompressed_data = zlib.decompress(bytes(bytearray(content)), zlib.MAX_WBITS|32)
            else:
                decompressed_data = brotli.decompress(content)
            content = decompressed_data
            f.write(decompressed_data)
        except zlib.error as e:
            print "Corrupted decoding: " + file + str(e)
            print "Simply copying the file"
            f.close()
            return
            # os._exit(0)
    else: 
        f.write(content)
    f.close()
    command = " {} -i {} -n '{}' -t {} -r {}".format(analyzer_script,TEMP_FILE, url + ";;;;" + filename,fileType, args.rewriter)

    if (args.debug) and fileType == args.debug and '675' in filename:
        command = "node --inspect-brk={}".format(node_debugging_port) + command
    else:
        command = "node " + command
    _log_path = log_directory+"/" + filename + "/"
    
    print 'making directory', _log_path
    subprocess.call("mkdir -p {}".format(_log_path), shell=True)

    log_file=open(_log_path+"logs","w+")
    error_file=open(_log_path+"errors","w")
    id_file = open(_log_path+'ids','w')

    print "Executing ", command
    cmd = subprocess.call(command, stdout=log_file, stderr =error_file, shell=True)

    log_file.close()
    error_file.close()
    
    try:
        returnInfoFile = TEMP_FILE + ".info";
        returnInfo = "".join(open(returnInfoFile,'r').readlines())

        id_file.write(returnInfo)
    except IOError as e:
        print "Error while reading info file" + str(e)

    id_file.close()

    subprocess.call("rm {} {} {}".format(TEMP_FILE, TEMP_FILE_zip, TEMP_FILE +".info"),stderr=open("/dev/null","r"), shell=True)

def main(args):
    file_counter = 0

    global filter_rules
    # filter_rules = Server('http://localhost:1006')
    for root, folder, files in os.walk(args.input):
        print "This directory has ", len(files), " number of files"
        url = root.split('/')[-2]

        htmlFiles = []
        jsFiles = []
        urls = {'js':[], 'html':[]}
        th = time.time()

        for file in files:
            try:
                file_counter += 1
                f = open(os.path.join(root,file), "rb")
                http_response = http_record_pb2.RequestResponse()
                http_response.ParseFromString(f.read())
                f.close()

                print "Checking: {} file : {}".format(file, file_counter)

                filename = http_response.request.first_line.split()[1] 
                fullurl = "http://{}{}".format(get_mm_header(http_response,'host'),filename)

                req_method = http_response.request.first_line.split()[0] # GET url-suffix HTTP1.1
                status = http_response.response.first_line.split()[1] #http1.1 200 ok

                if status != '200' or req_method != 'GET':
                    continue
                    
                file_type = None

                cur_file_obj = {'file':file, 'mm':http_response}
                for header in http_response.response.header:
                    if header.key.lower() == "content-type":
                        file_type = header.value.lower()
                        if "javascript" in file_type:
                            jsFiles.append(cur_file_obj)
                            urls['js'].append([fullurl,filename])
                        elif "html" in header.value.lower():
                            htmlFiles.append(cur_file_obj)
                            urls['html'].append([fullurl,filename])
        

            except IOError as e:
                print args.input + ": Could not open file ", e


    pool = mp.Pool(mp.cpu_count())

    instrument_singleton = partial(instrument, root, "js", args)
    
    pool.map(instrument_singleton, jsFiles)
    pool.close()
    pool.join()
    

    instrument_singleton = partial(instrument, root, "html", args)
    # for pid in childPids:
    #     print "waiting on pid", pid
    #     os.waitpid(pid,0)
    print "All the JS child processes died..\n Main thread terminating"


    pool = mp.Pool(mp.cpu_count())

    pool.map(instrument_singleton, htmlFiles)
    pool.close()
    pool.join()
    print "All the HTML child processes died..\n Main thread terminating"
    # if args.profile:
    #     print '[Time] Done with html {}'.format(time.time()-th)
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('input', help='path to input directory')
    parser.add_argument('rewriter', help='type of instrumentation to perform', default="comments")
    parser.add_argument('logDir', help='path to log output directory')
    parser.add_argument('--debug',help="enable node debugging using -inspect flag")
    args = parser.parse_args()
    main(args)

