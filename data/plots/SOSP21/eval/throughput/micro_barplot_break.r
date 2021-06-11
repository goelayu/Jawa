#!/usr/bin/env Rscript

library(cowplot)
library(ggplot2)
# library(ggforce)
library(wesanderson)

input <- "microp_500"

data <- read.table(input, header=T, stringsAsFactors=F)

# data <- read.table(input, header=T, stringsAsFactors=F)
data$x <- factor(data$x, levels=c("Filter", "CI", "DT", "ET", "Static"))


pdf("micro_zoom.pdf", height=2.5, width=5)
zoomed <- ggplot(data, aes(x=x, y=y, ymin=ymin, ymax=ymax)) +
    geom_bar( color="black", size=0.45, stat="identity", width=0.4) +
    geom_errorbar(width=0.15, size=0.9) +
    xlab("") +
    ylab("Latency(ms)") +
    coord_cartesian(ylim=c(-20, 520)) +
    scale_y_continuous(breaks=seq(0, 500, by=100), expand=c(0, 0)) +
    theme_bw() +
    theme(
        legend.title=element_blank(),
        legend.position="top",
        legend.margin=margin(0, 0, 0, 0),
        legend.box.margin=margin(-4, -4, -8, 0),
        legend.background=element_rect(color="black", fill="white", linetype="blank", size=0),
        legend.direction="horizontal",
        legend.key=element_blank(),
        legend.key.height=unit(11, "points"),
        legend.key.width=unit(25, "points"),
        legend.spacing.x=unit(1, "points"),
        legend.spacing.y=unit(0, "points"),
        legend.text=element_text(size=11, margin=margin(r=10)),
        strip.background=element_rect(color="white", fill="white"),
        strip.text=element_text(size=12),
        plot.margin=unit(c(5.5, 5.5, 5.5, 5.5), "points"),
        axis.text=element_text(color="black", size=11),
        axis.title.y=element_text(size=12, margin=margin(0, 3, 0, 0)),
        axis.title.x=element_blank())
full <- ggplot(data, aes(x=x, y=y, ymin=ymin, ymax=ymax)) +
    geom_bar( color="black", size=0.45, stat="identity", width=0.4) +
    geom_errorbar(width=0.15, size=0.9) +
    xlab("") +
    ylab("(Zoomed Out)") +
    coord_cartesian(ylim=c(-5500, 10500)) +
    scale_y_continuous(breaks=c(-5000, -2500, 0, 2500, 5000, 10000, 15000), expand=c(0, 0)) +
    theme_bw() +
    theme(
        legend.title=element_blank(),
        legend.position="top",
        legend.margin=margin(0, 0, 0, 0),
        legend.box.margin=margin(-4, -4, -8, 0),
        legend.background=element_rect(color="black", fill="white", linetype="blank", size=0),
        legend.direction="horizontal",
        legend.key=element_blank(),
        legend.key.height=unit(11, "points"),
        legend.key.width=unit(25, "points"),
        legend.spacing.x=unit(1, "points"),
        legend.spacing.y=unit(0, "points"),
        legend.text=element_text(size=11, margin=margin(r=10)),
        strip.background=element_rect(color="white", fill="white"),
        strip.text=element_text(size=12),
        plot.margin=unit(c(5.5, 5.5, 5.5, 5.5), "points"),
        axis.text=element_text(color="black", size=11),
        axis.title.y=element_blank(),
        axis.title.x=element_blank())
cowplot::plot_grid(zoomed, full, rel_widths=c(1, 1))
.junk <- dev.off()

