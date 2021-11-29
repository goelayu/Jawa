"""
Basic skeleton of a mitmproxy addon.

Run as follows: mitmproxy -s anatomy.py
"""
from mitmproxy import ctx
from mitmproxy.script import concurrent
import os
import random
import subprocess

rewriter = '/home/goelayu/research/webArchive/program_analysis/instrument.js'


def rewrite_js(content, type):
    file_name = str(random.randint(0, 100000))
    with open(file_name, 'w') as f:
        f.write(content)
    cmd = "node {} -i {} -n ';;;;testName' -t {} -r dynamic-cfg".format(
        rewriter, file_name, type)
    print(cmd)
    subprocess.call(cmd, stdout=subprocess.DEVNULL, shell=True)
    with open(file_name, 'r') as f:
        content = f.read()
    os.remove(file_name)
    return content


@concurrent
def response(flow):

    if flow.request.method != "GET":
        return
    try:

        content_type = None
        # print('thread id', os.getpid())
        for key in flow.response.headers.keys():
            if key.lower() == "content-type":
                content_type = flow.response.headers[key].lower()
        if not content_type:
            return

        if content_type.find('script') >= 0:
            flow.response.text = rewrite_js(flow.response.text, 'js')

        if content_type.find('html') >= 0:
            flow.response.text = rewrite_js(flow.response.text, 'html')
    except Exception as e:
        print('error while proxying response', e)
        return


# addons = [
#     Rewriter()
# ]
