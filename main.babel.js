'use strict';

//lightLine的状态 init：初始状态（长度为0）add：加长状态 keep:保持长度状态 subtract：减小长度状态 destroy覆灭状态（不再绘制）
var status_init = 'init';
var status_add = 'add';
var status_keep = 'keep';
var status_subtract = 'subtract';
var status_destroy = 'destroy';

/**
 * 绘制背景canvas（圆和线）
 * @param backCtx 背景canvas context
 * @param circles 圆形数组
 * @param lines 线条数组
 * @param isIdVisible 是否显示id，调试时使用
 */
function drawBackCanvas(backCtx, circles, lines, isIdVisible) {
    circles.forEach(function (circle) {
        //绘制圆
        backCtx.beginPath();
        backCtx.fillStyle = circle.fillStyle;
        backCtx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        backCtx.fill();
        backCtx.closePath();
        if (isIdVisible) {
            //圆形内显示id
            backCtx.beginPath();
            backCtx.fillStyle = "red";
            backCtx.font = "14px sans-serif";
            backCtx.fillText(circle.id + '', circle.x - 4, circle.y + 4); //为了居中显示，4像素是假设文本的高宽是8像素，实际不一定。
            backCtx.closePath();
        }
    });
    lines.forEach(function (line) {
        //由于圆形增加了透明度，所以globalCompositeOperation从视觉上不再有效，需要从圆和线的交点处划线而不是圆心处
        var from = circles.find(function (circle) {
            return circle.id === line.from;
        });
        var to = circles.find(function (circle) {
            return circle.id === line.to;
        });
        var fromOrigin = new Vector(from.x, from.y);
        var fromEndPoint = new Vector(to.x, to.y);
        var fromIntersect = findIntersect(fromOrigin, from.radius, fromEndPoint); //交点位置
        var toOrigin = new Vector(to.x, to.y);
        var toEndPoint = new Vector(from.x, from.y);
        var toIntersect = findIntersect(toOrigin, to.radius, toEndPoint); //交点位置
        //绘制线
        backCtx.beginPath();
        backCtx.strokeStyle = line.strokeStyle;
        backCtx.lineWidth = 2;
        backCtx.moveTo(fromIntersect.x, fromIntersect.y);
        backCtx.lineTo(toIntersect.x, toIntersect.y);
        backCtx.stroke();
        backCtx.closePath();
        //将交点坐标信息添加到circle上，避免重复计算
        line.fromIntersectX = fromIntersect.x;
        line.fromIntersectY = fromIntersect.y;
        line.toIntersectX = toIntersect.x;
        line.toIntersectY = toIntersect.y;
        if (isIdVisible) {
            //线上显示id
            backCtx.beginPath();
            backCtx.fillStyle = "yellow";
            backCtx.font = "14px sans-serif";
            backCtx.fillText(line.id + '', (from.x + to.x) / 2 - 4, (from.y + to.y) / 2 + 4);
            backCtx.closePath();
        }
    });
}

/**
 * 查找穿过圆心的射线和圆形的交点
 * @param {Vector} origin 圆心并且是线起始点
 * @param {number} radius 圆的半径
 * @param {Vector} lineEndPoint 线的终点
 * @return {Vector}     point of the intersection
 */
function findIntersect(origin, radius, lineEndPoint) {
    var subtract = lineEndPoint.subtract(origin);
    var lineLength = subtract.length();
    if (lineLength === 0) {
        throw new Error("长度需要是正数");
    }
    subtract = subtract.normalize();
    return origin.add(subtract.multiplyScalar(radius));
}

/**
 * 初始化line的坐标，不初始化其状态
 * @param lightLines 亮线数组
 * @param lines 线条数组
 * @param index 需要初始化的亮线的索引
 */
function initLightLineCoord(lightLines, lines, index) {
    var line = lines.find(function (line) {
        return line.id === lightLines[index].id;
    });
    //start和end点均从start交点处出发
    line.startX = line.fromIntersectX;
    line.startY = line.fromIntersectY;
    line.endX = line.fromIntersectX;
    line.endY = line.fromIntersectY;
}

/**
 * 初始化所有线的坐标和状态
 * @param lightLines 亮线数组
 * @param lines 线条数组
 */
function initLightLines(lightLines, lines) {
    lightLines.forEach(function (line, index, lightLineArray) {
        line = lines.find(function (lineItem) {
            return lineItem.id === line.id;
        });
        initLightLineCoord(lightLines, lines, index);
        var fromVector = new Vector(line.fromIntersectX, line.fromIntersectY);
        var toVector = new Vector(line.toIntersectX, line.toIntersectY);
        line.maxLength = fromVector.subtract(toVector).length() / 2;
        if (index === 0) {
            line.status = status_init;
        } else {
            line.status = status_destroy;
        }
        lightLineArray[index] = line; //改变数组的值
    });
}

/**
 * 绘制上层canvas（移动的菱形）
 * @param frontCanvas 前景canvas
 * @param frontCtx 前景canvas的context
 * @param lightLines 亮线数组
 * @param lines 线条数组
 */
function drawFrontCanvas(frontCanvas, frontCtx, lightLines, lines) {
    //重绘前清空上层canvas
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    lightLines.forEach(function (lightLine, lightLineIndex, lightLineArray) {
        drawLightLine(frontCtx, lightLine, lightLineIndex, lightLineArray, lines);
    });
    window.requestAnimationFrame(function () {
        drawFrontCanvas(frontCanvas, frontCtx, lightLines, lines);
    });
}

/**
 * 绘制亮线（菱形）
 * @param frontCtx 前景canvas的context
 * @param lightLine 亮线
 * @param lightLineIndex 亮线的索引
 * @param lightLineArray 亮线的数组
 * @param lines 线条数组
 */
function drawLightLine(frontCtx, lightLine, lightLineIndex, lightLineArray, lines) {
    if (lightLine.status === status_destroy) {
        //line已经绘制一个生命周期，不再绘制，除非改变其status
        return;
    }
    //从初始化状态进入增加长度状态
    if (lightLine.status === status_init) {
        lightLine.status = status_add;
    }
    //斜边移动的像素
    var step = 1;
    //斜边像素在x轴上的投影
    var widthStep = calWidthStep(lightLine.fromIntersectX, lightLine.fromIntersectY, lightLine.toIntersectX, lightLine.toIntersectY, step);
    //斜边像素在y轴上的投影
    var heightStep = calHeightStep(lightLine.fromIntersectX, lightLine.fromIntersectY, lightLine.toIntersectX, lightLine.toIntersectY, step);
    //计算亮线长度
    var start = new Vector(lightLine.startX, lightLine.startY);
    var end = new Vector(lightLine.endX, lightLine.endY);
    var length = start.subtract(end).length();
    if (lightLine.status === status_add) {
        //长度从0到maxLength阶段
        //移动end
        if (lightLine.toIntersectX > lightLine.fromIntersectX) {
            lightLine.endX += widthStep;
        } else if (lightLine.toIntersectX < lightLine.fromIntersectX) {
            lightLine.endX -= widthStep;
        } else {//lightLine.toIntersectX === lightLine.fromIntersectX
        }
        if (lightLine.toIntersectY > lightLine.fromIntersectY) {
            lightLine.endY += heightStep;
        } else if (lightLine.toIntersectY < lightLine.fromIntersectY) {
            lightLine.endY -= heightStep;
        } else {} //lightLine.toIntersectY === lightLine.fromIntersectY

        //如果长度超过最大长度，则进入维持长度状态
        if (length >= lightLine.maxLength) {
            lightLine.status = status_keep;
        }
    } else if (lightLine.status === status_keep) {
        //长度维持在maxLength阶段
        //start和end同时移动
        if (lightLine.toIntersectX > lightLine.fromIntersectX) {
            lightLine.startX += widthStep;
            lightLine.endX += widthStep;
        } else if (lightLine.toIntersectX < lightLine.fromIntersectX) {
            lightLine.startX -= widthStep;
            lightLine.endX -= widthStep;
        } else {//lightLine.toIntersectX === lightLine.fromIntersectX
        }
        if (lightLine.toIntersectY > lightLine.fromIntersectY) {
            lightLine.startY += heightStep;
            lightLine.endY += heightStep;
        } else if (lightLine.toIntersectY < lightLine.fromIntersectY) {
            lightLine.startY -= heightStep;
            lightLine.endY -= heightStep;
        } else {} //lightLine.toIntersectY === lightLine.fromIntersectY

        //end是否已经移动到交点处
        var endInter = false;
        if (lightLine.toIntersectX > lightLine.fromIntersectX) {
            if (lightLine.endX >= lightLine.toIntersectX) {
                endInter = true;
            }
        } else if (lightLine.toIntersectX < lightLine.fromIntersectX) {
            if (lightLine.endX <= lightLine.toIntersectX) {
                endInter = true;
            }
        } else {
            if (lightLine.toIntersectY > lightLine.fromIntersectY) {
                if (lightLine.endY >= lightLine.toIntersectY) {
                    endInter = true;
                }
            } else if (lightLine.toIntersectY < lightLine.fromIntersectY) {
                if (lightLine.endY <= lightLine.toIntersectY) {
                    endInter = true;
                }
            } else {
                throw new Error('开始交点和结束交点重合');
            }
        }
        //如果end已经移动到交点处，则进入减小状态
        if (endInter) {
            lightLine.status = status_subtract;
        }
    } else if (lightLine.status === status_subtract) {
        //长度从maxLength到0阶段
        //移动start
        if (lightLine.toIntersectX > lightLine.fromIntersectX) {
            lightLine.startX += widthStep;
        } else if (lightLine.toIntersectX < lightLine.fromIntersectX) {
            lightLine.startX -= widthStep;
        } else {// lightLine.toIntersectX === lightLine.fromIntersectX
        }
        if (lightLine.toIntersectY > lightLine.fromIntersectY) {
            lightLine.startY += heightStep;
        } else if (lightLine.toIntersectY < lightLine.fromIntersectY) {
            lightLine.startY -= heightStep;
        } else {} //lightLine.toIntersectY === lightLine.fromIntersectY

        //将下个line的状态设置为init以开始移动
        if (lightLineIndex === lightLineArray.length - 1) {
            if (lightLineArray[0].status === status_destroy) {
                initLightLineCoord(lightLineArray, lines, 0); //只设置坐标，不设置状态
                lightLineArray[0].status = status_init;
            }
        } else {
            if (lightLineArray[lightLineIndex + 1].status === status_destroy) {
                initLightLineCoord(lightLineArray, lines, lightLineIndex + 1); //只设置坐标，不设置状态
                lightLineArray[lightLineIndex + 1].status = status_init;
            }
        }
        //start是否已经移动到end交点处
        var startInter = false;
        if (lightLine.toIntersectX > lightLine.fromIntersectX) {
            if (lightLine.startX >= lightLine.toIntersectX) {
                startInter = true;
            }
        } else if (lightLine.toIntersectX < lightLine.fromIntersectX) {
            if (lightLine.startX <= lightLine.toIntersectX) {
                startInter = true;
            }
        } else {
            if (lightLine.toIntersectY > lightLine.fromIntersectY) {
                if (lightLine.startY >= lightLine.toIntersectY) {
                    startInter = true;
                }
            } else if (lightLine.toIntersectY < lightLine.fromIntersectY) {
                if (lightLine.startY <= lightLine.toIntersectY) {
                    startInter = true;
                }
            } else {
                throw new Error('开始交点和结束交点重合');
            }
        }
        //如果start也超过end交点，则将line的状态设置为destroy不再绘制line
        if (startInter) {
            lightLine.status = status_destroy;
        }
    }
    /**
     * 开始绘制菱形的亮线
     * start和end为菱形的长轴端点，从start和end的中心点向垂直方向偏移L像素的两个点为菱形的短轴端点
     */
    /*
    * 中点垂直斜线方程
    * 已知斜线方程为k，则垂直斜线斜率为-1 / k
    *   k = -1 / ((y1 - y2) / (x1 - x2))
    *   k = (x2 - x1) / (y1 - y2)
    * 中点坐标为x: (x1 + x2) / 2 y: (y1 + y2) / 2
    * 将中点带入方程
    *   (y1 + y2) / 2 = (-1 / ((y1 - y2) / (x1 - x2))) *  ((x1 + x2) / 2) + b
    *   (y1 + y2) / 2 = (-1 * (x1 - x2) / (y1 - y2)) *  ((x1 + x2) / 2) + b
    *   (y1 + y2) / 2 = ((x2 - x1) / (y1 - y2)) *  ((x1 + x2) / 2) + b
    *   b = (y1 + y2) / 2 - ((x2 - x1) / (y1 - y2)) *  ((x1 + x2) / 2)
    *
    * 假设距离为L，求点的坐标为x,y，已知点坐标为x0,y0，根据勾股定理可得如下一元二次方程
    *   (y - y0)^2 + (x - x0)^2 = L^2
    * 联合中点垂直斜线的方程
    *   y = kx + b
    * 代入y，得x的一元二次方程：
    *   (k^2+1)x^2+2[(b-y0)k-x0]x+[(b-y0)^2+x0^2-L^2]=0
    * 一元二次方程Ax^2+Bx+C=0中,
    * 一元二次方程求根公式：
    *   x1,x2= [-B±√(B^2-4AC)]/2A
    * */
    /*
    * 斜线方程
    *   y = k*x + b
    * 代入两个点
    *   y1 = k * x1 + b
    *   y2 = k * x2 + b
    * 求k
    *   y1 - y2 = k * (x1 - x2)
    *   k = (y1 - y2) / (x1 - x2)
    * 求b
    *   b = y1 - ((y1 - y2) / (x1 - x2)) * x1
    *   b = y1 - (y1 * x1 - y2 * x1)/(x1 - x2)
    *   b = (y1 * x1 - y1 * x2 - y1 * x1 + y2 * x1) /  (x1 - x2)
    *   b = (y2 * x1 - y1 * x2) / (x1 - x2)
    */
    var startX = lightLine.startX;
    var startY = lightLine.startY;
    var endX = lightLine.endX;
    var endY = lightLine.endY;
    var x1 = void 0;
    var x2 = void 0;
    var y1 = void 0; //y = kx + b
    var y2 = void 0; //y = kx + b
    var L = 1.8; // 垂直中线的偏移像素
    if (startY !== endY) {
        var k = (endX - startX) / (startY - endY); //k = (x2 - x1) / (y1 - y2)
        var b = (startY + endY) / 2 - (endX - startX) / (startY - endY) * ((startX + endX) / 2); //(y1 + y2) / 2 - ((x2 - x1) / (y1 - y2)) *  ((x1 + x2) / 2)
        var centerX = (startX + endX) / 2;
        var centerY = (startY + endY) / 2;
        var A = Math.pow(k, 2) + 1; //(k^2+1)
        var B = 2 * ((b - centerY) * k - centerX); // B=2[(b-y0)k-x0]
        var C = Math.pow(b - centerY, 2) + Math.pow(centerX, 2) - Math.pow(L, 2); // C=(b-y0)^2+x0^2-L^2
        x1 = (-B + Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
        x2 = (-B - Math.sqrt(Math.pow(B, 2) - 4 * A * C)) / (2 * A);
        y1 = k * x1 + b; //y = kx + b
        y2 = k * x2 + b; //y = kx + b
    } else {
        //如果是横线，此时斜率无穷大，需要单独计算
        x1 = (startX + endX) / 2;
        x2 = (startX + endX) / 2;
        y1 = startY - L;
        y2 = startY + L;
    }
    frontCtx.beginPath();
    //从中点处向左右各偏移L像素，形成菱形
    frontCtx.moveTo(startX, startY);
    frontCtx.lineTo(x1, y1);
    frontCtx.lineTo(endX, endY);
    frontCtx.lineTo(x2, y2);
    frontCtx.lineTo(startX, startY);
    frontCtx.closePath();
    var gradient = frontCtx.createRadialGradient(startX, startY, 5, endX, endY, 5);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "white");
    frontCtx.fillStyle = gradient;
    frontCtx.fill();
}

/**
 * 计算斜边step在x轴上的投影
 */
function calWidthStep(x1, y1, x2, y2, step) {
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    if (dx === 0) {
        return 0;
    }
    if (dy === 0) {
        return step;
    }
    var dz = Math.sqrt(dx * dx + dy * dy); //斜边
    return dx * step / dz;
}

/**
 * 计算斜边step在y轴上的投影
 */
function calHeightStep(x1, y1, x2, y2, step) {
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    if (dx === 0) {
        return step;
    }
    if (dy === 0) {
        return 0;
    }
    var dz = Math.sqrt(dx * dx + dy * dy); //斜边
    return dy * step / dz;
}
