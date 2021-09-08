import random
import sys

if len(sys.argv) != 3:
    print "Insufficient arguments\nUsage: python generateRandomSites.py <path-to-urls> <number-of-site>"
    sys.exit(1)

alreadySeen = []
sites = open(sys.argv[1],"r")
number = int(sys.argv[2])
sites = sites.readlines()

if len(sys.argv) < 3:
    print "Insufficient arguments\nUsage: python generateRandomSites.py <path-to-urls> <number-of-site>"

rSites = []
for i in range(number):
        index  = random.randint(0,len(sites)-1)
        while index in alreadySeen:
            index = random.randint(0,len(sites)-1)
        rSites.append(sites[index])
        alreadySeen.append(index)
 
# print rSites
# rSitesFile = open(sys.argv[3],"w")
for rsite in rSites:
    # rSitesFile.write(rsite)
    print rsite.strip()

# rSitesFile.close()
