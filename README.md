# Jawa

A web crawler for web archives that tackles the problem of increasing presence of JavaScript
on modern web pages, resulting in poor fidelity and high storage overhead .
Jawa's lightweight techniques are rooted in the key insights drawn from extensive JavaScript program analysis performed on a large corpus of web pages.

Jawa reduces the storage overhead for a million web pages archived by Internet Archive by 40% and eliminates all fidelity related issue, while improving crawling throughput by 50%.

For more information, kindly refer to our OSDI'22 paper: [Jawa: Web Archival in the Era of JavaScript](https://goelayu.github.io/publication/jawa-2021)

This repoistorory contains the source code and dataset to reproduce the key results from our paper.

# Overview

- [Getting Started](#getting-started)
- [Kick-the-tires](#kick-the-tires)
- [Experiments](#experiments)
- [Contact](#contact)

# Getting Started

You can either [manually](#manual-installation) set up this repository and the dependencies, or
use our [virtual machine](#pre-installed-virtual-machine) containing all the dependencies and the source code.

## Manual Installation

Install the dependencies:

```bash
sudo apt-get install mahimahi google-chrome-stable
```

## Pre-Installed Virtual Machine

Only available for artifact evaluation committee. Kindly [contact](#contact) us for more information.
