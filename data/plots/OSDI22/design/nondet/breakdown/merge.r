#!/usr/bin/env Rscript
# Arguments: <path to input file> <path to output file>
library(ggplot2)
library(wesanderson)
library(grid)

breaks_fun <- function(x) {
    write(max(x), stdout())
  if (max(x) == 52) {
    seq(0, 30, 10)
  } else {
    seq(0, 10, 5)
  }
}

lim_func <- function(x){
    if (max(x) == 52){
        c(0,30)
    } else {
        c(0,10)
    }
}


args <- commandArgs(trailingOnly=TRUE)

data.log <- read.csv(args[1], header=TRUE, sep=",")
data.net <- read.csv(args[2], header=TRUE, sep=",")

data.log$Op <- "Client characterstics"
data.net$Op <- "DRP"
data.log$network <- factor(data.log$network, levels=c('Fuzzy', 'Querystrip','Exact'))
data.all <- rbind(data.log, data.net)

# blank_data <- data.frame(Op = c("Runtime Exceptions", "Runtime Exceptions", "Network errors", "Network errors"), x = c(0,10,0,30))

pdf("urlmatching.pdf", height=2.5, width=5)
ggplot(data.all, aes(x=plt, linetype=network)) +
	stat_ecdf(size=0.8) +
	xlab("Fraction of URLs unmatched") +
	ylab("CDF across pages") +
	facet_wrap(~ Op, ncol=2) +
	coord_cartesian(xlim=c(0,1),ylim=c(0, 1)) +
    # geom_blank(data = blank_data, aes(x = x)) + facet_wrap(~Op, scales = "free_x") +
	scale_x_continuous(, expand=c(0, 0)) +
	scale_y_continuous( expand=c(0, 0)) +
	scale_color_manual(values=wes_palette("Rushmore1")[c(4, 5, 1)]) +
	theme_bw() +
    theme(panel.spacing = unit(2, "lines")) + 
	theme(
		legend.title=element_blank(),
		legend.background=element_rect(color="white", fill="white", linetype="solid", size=0.3),
		legend.key=element_blank(),
		legend.key.height=unit(12, "points"),
		legend.key.width=unit(30, "points"),
		legend.spacing.x=unit(3, "points"),
		legend.text=element_text(size=11),
		legend.position=c(0.80, 0.41),
		legend.margin=margin(t=2, r=2, b=2, l=2),
		strip.background=element_rect(color="white", fill="white"),
		strip.text=element_text(size=12),
		axis.text=element_text(color="black", size=12),
		axis.text.x=element_text(color="black", size=11),
		axis.title.y=element_text(size=13, margin=margin(0, 10, 0, 0)),
		axis.title.x=element_text(size=13, margin=margin(10, 0, 0, 0)))
.junk <- dev.off()