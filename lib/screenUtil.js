/**
 * Created by hua on 16/6/29.
 */

function getDesireWidth(width) {
    var screenWidth = window.screen.width;
    return Math.round(width * screenWidth / 1440)
}

function getDesireHeight(height) {
    var screenHeight = window.screen.height;
    return Math.round(height * screenHeight / 900)
}