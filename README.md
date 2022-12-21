# Jawa

### Code repository for our _OSDI'22_ paper: [Jawa: Web Archival in the Era of JavaScript](https://goelayu.github.io/publication/jawa-2022)

#

A web crawler for web archives that tackles the problem of increasing presence of JavaScript
on modern web pages, resulting in poor fidelity and high storage overhead.\
Jawa's lightweight techniques are rooted in the key insights drawn from extensive JavaScript program analysis performed on a large corpus of web pages.

Jawa reduces the storage overhead for a million web pages archived by Internet Archive by 40% and eliminates all fidelity related issue, while improving crawling throughput by 40%.

This repository contains the source code and dataset to reproduce the key results from our paper.

# Overview

- [Artifact Claims](#artifact-claims)
- [Getting Started](#getting-started)
- [Kick-the-tires](#kick-the-tires)
- [Experiments](#experiments)
- [Contact](#contact)

# Artifact Claims

This artifact can be used to evaluate the three main claims in our paper: 1) Improved fidelity by eliminating almost all failed network fetches, 2) Significant reduction in storage overhead of all web resources and 3) Improved crawling throughput.

## Fidelity

To evaluate Jawa's fidelity, we provide scripts and data to exactly reproduce Figure 8 (both a and b) in our paper.

## Storage

In our paper, we evaluate Jawa's storage overhead on a corpus of 1 million pages (Figure 7). Processing and loading this entire corpus takes around \~1 week of CPU time and around \~100 CPU cores. Since this is infeasible for the purposes of artifact evaluation, we instead demonstate Jawa's storage benefits on a much smaller corpus of 3000 pages. We show storage benefits of our two techniques: a) JavaScript code filtering and b) Eliminating unused JavaScript functions on this corpus, and hope the evalutors can extrapolate this result to the full corpus.

### Throughput

We provide scripts and data to exactly reproduce Figure 9 in our paper.

# Getting Started

You can either [manually](#manual-installation) set up this repository and the dependencies, or
use our [virtual machine](#pre-installed-virtual-machine) containing all the dependencies and the source code pre-installed.

## Manual Installation

Install the dependencies:

```bash
sudo apt-get install mahimahi google-chrome-stable parallel r-base r-base-core
R #launches interactive shell
> install.packages("ggplot2") #follow the instructions (takes about 4-5min)
> install.packages("wesanderson")
```

Get the source code and node dependencies:

```bash
git clone https://github.com/goelayu/Jawa
cd Jawa
npm install
export NODE_PATH=${PWD}
```

Patch the adblocker to use Jawa's custom filter list. \
Modify the following file:

```bash
vim node_modules/puppeteer-extra-plugin-adblocker/dist/index.cjs.js
add to line 73: return adblockerPuppeteer.PuppeteerBlocker.parse(fs.readFileSync('../filter-lists/combined-alexa-3k.txt', 'utf-8'));
```

Fetch and extract the data containing precorded web pages (tar takes ~3-5mins depending on your disk IO bandwidth)

```bash
wget web.eecs.umich.edu/~goelayu/corpus.tar
tar -xf corpus.tar
```

Now you should be able to run the simple examples mentioned in [kick-the-tires](#kick-the-tires).

## Pre-Installed Virtual Machine

Virtual machine access only available for OSDI'22 AEC. Kindly [contact](#contact) us for access.

# Kick-the-tires

## Examples

Each example should take 2-3 seconds. The output log would print _Site loaded_ to imply a successful execution.

### Load Chrome and fetch network log

```bash
mkdir data
cd scripts
node chrome-launcher.js -u https://www.cnn.com -o ../data --timeout 10000 -n
```

File `../data/network` should be created containing network log of www.cnn.com.

### Enable filtering of unwanted JavaScript files

```bash
node chrome-launcher.js -u https://www.cnn.com -o ../data --timeout 10000 -n --filter
```

A new network file should be created at the same location, this time with only relevant files. You can use `du -sh` to verify that the two network files are significantly different, with the latter (filtered log) being much smaller.

### Load Chrome using prerecorded files (network disabled)

```bash
mkdir -p ../data/performance
echo https://me.me/t/so-much-to-do-so-little-desire-to-do-it |  while read i; do  DATAFLAGS=" -j  --timeout 15000 -n" ./replay_mahimahi.sh ../record ../data/performance/ replay live $i ; done
```

Similar to above, you should be able to verify existence of network logs at `../data/performance//me.me_t_so-much-to-do-so-little-desire-to-do-it/network`.

# Experiments

All the experiments related code resides in the [ae/](ae) directory

## Fidelity

We provide scripts and data to exactly reproduce Figure 8 (both a and b) in our paper.\
The corpus used for this experiment contained 3000 web pages. On single core machine (such as the VM provided by us), it takes roughly ~20-30seconds for each web page to load, and therefore takes about **~10hours** to load 3000 web pages. \
We recommend to either run this experiment on a smaller corpus of pages (more details below) which would take ~1-2hours or to use a multi-core (~16-32cores) machine to speed up the overall execution time.

### Instructions

```bash
cd ../ae
# Usage: ./fidelity.sh <corpus_size> <num of parallel processes>
./fidelity.sh 300 1 # depending on the number of cores on your machine, provide the 2nd argument. If running on our VM, provide 1.
```

The above script should take roughly **~10hours** on a single core machine. \
The output graphs would be generated in the same directory: `size_fidelity.pdf` and `count_fidelity.pdf`.
Since we don't run on the entire of 3000 pages, these graphs would be an approximate version of Figure 8 (a and b) in our paper.

## Storage

Reproducing Figure 7 requires processing 1 million pages, which would take over a week of CPU time (and 100+ CPU cores). \
We instead provide scripts to process 3000 pages, demonstrate storage savings due to both of our techniques (as mentioned in the [Artifact Claims](#artifact-claims)), and hope the evaluators can extrapolate this result to the full corpus.

### Instructions

We provide preprocessed web pages, i.e., injected with instrumentation code to detect which functions are executed at runtime, and code to track event handlers. \
You can fetch the the tar file as follows:

```bash
cd ../data;
wget web.eecs.umich.edu/~goelayu/processed.tar
tar -xf processed.tar
```

```bash
cd ../ae
# Usage: ./storage.sh <corpus_size> <num of parallel processes>
./storage.sh 300 1 # depending on the number of cores on your machine, provide the 2nd argument. If running on our VM, provide 1.
```

The above script will print three storage numbers (in bytes) to the console.

1. Total JS storage after deduplication (as incurred by Internet Archive) -- this mimics the IA bar in Figure 7a.
2. Total JS storage after applying Jawa's filter -- this mimics the IA+Combined Filter bar in Figure 7a.
3. Total JS storage after applying removing unused JS functions -- this mimics the Jawa bar in Figure 7a.

## Throughput

We reproduce the throughput results in Table 3: Crawling index IOs.

The storage script above outputs the crawling index IOs as well.

## Reference

Please cite our OSDI'22 paper if you use this code in your research:

```bibtex
@inproceedings{goel2022jawa,
  title={Jawa: Web Archival in the Era of $\{$JavaScript$\}$},
  author={Goel, Ayush and Zhu, Jingyuan and Netravali, Ravi and Madhyastha, Harsha V},
  booktitle={16th USENIX Symposium on Operating Systems Design and Implementation (OSDI 22)},
  pages={805--820},
  year={2022}
}
```
# Contact

Kindly contact Ayush Goel at goelayu@umich.edu for any questions or comments regarding this project. \
We are also happy to receive code contributions.
