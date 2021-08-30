from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCServer
import os
from adblockparser import AdblockRules

DIR = os.path.dirname(os.path.abspath(__file__))
filter_list = "{}/../filter-lists/combined.txt".format(DIR)

def get_filter_rules():
    with open(filter_list,'rb') as f:
        raw_rules = f.read().decode('utf8').splitlines()
    rules = AdblockRules(raw_rules,use_re2=True, max_mem=512*1024*1024)
    return rules

def should_block(url):
    return filter_rules.should_block(url,options={'third-party':True})

def get_filter():
    return filter_rules

def main():
    global filter_rules
    filter_rules = get_filter_rules()
    server = SimpleJSONRPCServer(('localhost', 1006))
    server.register_function(should_block)
    server.register_function(get_filter)
    print("Start server")
    server.serve_forever()

if __name__ == '__main__':  
    main()


