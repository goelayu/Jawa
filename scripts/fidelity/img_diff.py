import cv2
import numpy as np
import os

total = 1920 * 1080 * 3 # resolution * channels

def score(a, b):
    diff = a - b
    same = np.count_nonzero(diff == 0)
    return same / total

def run():
    img1 = cv2.imread("./img1.png")
    img2 = cv2.imread("./img2.png")

    print(f"{score(img1, img2):.4f}")

    imgdiff = np.absolute(img1 - img2)
    cv2.imwrite('diff.png', imgdiff)

run()
