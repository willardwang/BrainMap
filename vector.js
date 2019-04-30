/**
 * 用于矢量计算的类
 */
class Vector {
    /**
     * 构造函数
     * @param x 横坐标
     * @param y 纵坐标
     */
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * 矢量加
     * @param vector
     * @returns {Vector}
     */
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    /**
     * 矢量减
     * @param vector
     * @returns {Vector}
     */
    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    /**
     * 矢量乘
     * @param vector
     * @returns {Vector}
     */
    multiply(vector) {
        return new Vector(this.x * vector.x, this.y * vector.y);
    }

    /**
     * 矢量乘以标量
     * @param scalar
     * @returns {Vector}
     */
    multiplyScalar(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * 矢量除
     * @param vector
     * @returns {Vector}
     */

    divide(vector) {
        return new Vector(this.x / vector.x, this.y / vector.y);
    }

    /**
     * 矢量除以标量
     * @param scalar
     * @returns {Vector}
     */
    divideScalar(scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    }

    /**
     * 矢量长度
     * @returns {number}
     */
    length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * 矢量标准化
     * @returns {Vector}
     */
    normalize() {
        return this.divideScalar(this.length());
    }
}