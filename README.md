# Jawa

A web crawler for web archives that tackles the problem of increasing presence of JavaScript
on modern web pages, resulting in poor fidelity and high storage overhead.\
Jawa's lightweight techniques are rooted in the key insights drawn from extensive JavaScript program analysis performed on a large corpus of web pages.

Jawa reduces the storage overhead for a million web pages archived by Internet Archive by 40% and eliminates all fidelity related issue, while improving crawling throughput by 50%.

For more information, kindly refer to our OSDI'22 paper: [Jawa: Web Archival in the Era of JavaScript](https://goelayu.github.io/publication/jawa-2021)

This repository contains the source code and dataset to reproduce the key results from our paper.

# Overview

- [Getting Started](#getting-started)
- [Kick-the-tires](#kick-the-tires)
- [Experiments](#experiments)
- [Contact](#contact)

# Getting Started

You can either [manually](#manual-installation) set up this repository and the dependencies, or
use our [virtual machine](#pre-installed-virtual-machine) containing all the dependencies and the source code pre-installed.

## Manual Installation

Install the dependencies:

```bash
sudo apt-get install mahimahi google-chrome-stable
```

Get the source code and node dependencies:

```bash
git clone https://github.com/goelayu/Jawa
cd Jawa
npm install
```

Patch the adblocker to use Jawa's custom filter list. \
Modify the following file:

```bash
vim node_modules/puppeteer-extra-plugin-adblocker/dist/index.cjs.js
add to line 73: return adblockerPuppeteer.PuppeteerBlocker.parse(fs.readFileSync('../filter-lists/combined-alexa-3k.txt', 'utf-8'));
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

```
