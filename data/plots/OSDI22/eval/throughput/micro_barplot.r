#!/usr/bin/env Rscript
# Arguments: <path to input file> <path to output file>
library(ggplot2)
library(wesanderson)

args <- commandArgs(trailingOnly=TRUE)
output <- args[2]

data <- read.csv(args[1], header=TRUE, sep=" ")

# data2 <- read.csv(args[2], header=TRUE, sep=",")

# data$network <- factor(data$network, levels = rev(levels(data$network)))
# data$network <- factor(data$network, levels=c("1day","30min","1min"))
# breaks <- c("Wired, all cores","4G, all cores", "4G, 4 cores disabled")
# labels <- c("lecpu","3g","4g","infinite","cpu-1")
# colnames(data)
# data$category <- factor(data$fraction)
data$x <- factor(data$x, levels=c("Filter","CI","DT", "ET","Static","Tune"))
pdf(output, height=2.5, width=5.0)
ggplot(data, aes(x=x,y=y)) +
    # stat_ecdf(pad = FALSE,size=1) +
    # geom_ribbon(aes(ymin=plt, ymax=1)) + 
    geom_bar(position="dodge",stat="identity")+
    geom_errorbar(aes(ymin=ymin, ymax=ymax), width=.2,position=position_dodge(.01)) +
    # stat_ecdf(data =  data2) +
    xlab("Technique") +
    ylab("Latency overhead(ms)") +
    guides(fill=guide_legend(title="Config")) +
    coord_cartesian(ylim=c(-550,1600)) +
    # scale_x_continuous(expand=c(0, 0)) +
     scale_y_continuous(expand=c(0, 0)) + 
    #  scale_x_discrete(breaks=c(100,200,300,400,500,600),labels=c("0-100","100-200","200-300","300-400","400-500","500-600")) +
     # scale_color_brewer(breaks=breaks, limits=breaks) + 
     # scale_x_continuous(sec.axis = sec_axis(~.*1000000, name = "Unique Invocation Count")) + 
    # scale_linetype_manual(values=c("dotted","solid","longdash")) + 
    theme_bw() +
    # scale_linetype_manual(values = c("solid","dash","longdash")) + 
    # guides(fill = guide_legend(nrow = 1))+
    # guides(colour=guide_legend(nrow=4, byrow=TRUE), linetype=guide_legend(nrow=4, byrow=TRUE), direction="vertical") +
    theme(
        legend.title=element_blank(),
        legend.background=element_rect(color="darkgray", fill="white", linetype="solid", size=0.3),
        legend.key=element_blank(),
        legend.key.height=unit(12, "points"),
        legend.key.width=unit(30, "points"),
        # legend.position=c(0.70, 0.35),
        legend.position="top",
        legend.margin=margin(c(1,3,3,3)),
        axis.title=element_text(size=12),
        axis.text=element_text(size=12),
        legend.text=element_text(size=12),
        axis.title.y=element_text(margin=margin(0, 20, 0, 0)),
        axis.title.x=element_text(margin=margin(10, 0, 0, 0)),
        plot.margin=unit(c(15,25,15,15),"points"))
        


.junk <- dev.off()

# lines(ecdf(data2$plt))
#for the js to computation ratio, the input file used was js_fraction_cold.csv
