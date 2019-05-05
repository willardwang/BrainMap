"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 用于矢量计算的类
 */
var Vector = function () {
  /**
   * 构造函数
   * @param x 横坐标
   * @param y 纵坐标
   */
  function Vector(x, y) {
    _classCallCheck(this, Vector);

    this.x = x || 0;
    this.y = y || 0;
  }

  /**
   * 矢量加
   * @param vector
   * @returns {Vector}
   */


  _createClass(Vector, [{
    key: "add",
    value: function add(vector) {
      return new Vector(this.x + vector.x, this.y + vector.y);
    }

    /**
     * 矢量减
     * @param vector
     * @returns {Vector}
     */

  }, {
    key: "subtract",
    value: function subtract(vector) {
      return new Vector(this.x - vector.x, this.y - vector.y);
    }

    /**
     * 矢量乘
     * @param vector
     * @returns {Vector}
     */

  }, {
    key: "multiply",
    value: function multiply(vector) {
      return new Vector(this.x * vector.x, this.y * vector.y);
    }

    /**
     * 矢量乘以标量
     * @param scalar
     * @returns {Vector}
     */

  }, {
    key: "multiplyScalar",
    value: function multiplyScalar(scalar) {
      return new Vector(this.x * scalar, this.y * scalar);
    }

    /**
     * 矢量除
     * @param vector
     * @returns {Vector}
     */

  }, {
    key: "divide",
    value: function divide(vector) {
      return new Vector(this.x / vector.x, this.y / vector.y);
    }

    /**
     * 矢量除以标量
     * @param scalar
     * @returns {Vector}
     */

  }, {
    key: "divideScalar",
    value: function divideScalar(scalar) {
      return new Vector(this.x / scalar, this.y / scalar);
    }

    /**
     * 矢量长度
     * @returns {number}
     */

  }, {
    key: "length",
    value: function length() {
      return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    /**
     * 矢量标准化
     * @returns {Vector}
     */

  }, {
    key: "normalize",
    value: function normalize() {
      return this.divideScalar(this.length());
    }
  }]);

  return Vector;
}();
