var A = function(selector, context) {
    //如果selector是一个函数则执行window.onload
    if(typeof selector === 'function') {
        A(window).on('load', selector);
    }else {
        // 创建新对象
        return A.fn.init(selector, context);
    }
}

A.fn = A.prototype = {
    // 强化构造函数
    constructor: A,
    init: function(selector, context) {
        if(typeof selector === 'object') {
            this[0] = selector;
            this.length = 1;
            return this;
        }
        this.length = 0;
        context = document.getElementById(context) || document;
        // id选择器
        if(~selector.indexOf('#')) {
            this[0] = document.getElementById(selector.slice(1));
            this.length = 1;
        }
        // class选择器
        else if(~selector.indexOf('.')) {
            var doms = [],
                className = selector.slice(1);
            // 兼容低版本id通过class获取元素
            if(context.getElementsByClassName) {
                doms = context.getElementsByClassName(className);
            } else {
                doms = context.getElementsByClassName('*');
            }
            var domLen = doms.length;
            for (var i = 0;i < domLen;i ++) {
                if(doms[i].className && !!~doms[i].className.indexOf(className)) {
                    this[this.length] = doms[i];
                    this.length ++;
                }
            }
        }
        // tagname
        else {
            var doms = context.getElementsByTagName(selector),
                i = 0,
                len = doms.length;
            for(;i < len;i ++) {
                this[i] = doms[i];
            }
            this.length = len;
        }
        this.context = context;
        this.selector = selector;
        return this;
    },
    length: 0,
    push: [].push,
    splice: [].splice
}

A.fn.init.prototype = A.fn;

// 兼容方法
var compatibleLib = {
    _on: (function() {
        if(document.addEventListener) {
            return function(dom, type, fn, data) {
                dom.addEventListener(type, function(e) {
                    fn.call(dom, e, data);
                }, false)
            }
        } else if (document.attachEvent) {
            return function(dom, type, fn, data) {
                dom.attachEvent('on' + type, function(e) {
                    fn.call(dom, e, data);
                })
            }()
        }
    })(),
    _getStyle : function(el, key) {
        return el.currentStyle ? el.currentStyle[key] : getComputedStyle(el, false)[key];
    }

}

A.extend = A.fn.extend = function() {
    var i = 1,
        len = arguments.length,
        target = arguments[0],
        j;
    // 如果一个参数，则为当前对象扩展方法
    if (i == len) {
        target = this;
        i --;
    }
    for(; i < len;i ++) {
        for (j in arguments[i]) {
            target[j] = arguments[i][j];
        }
    }

    return target;
}

A.extend({
    // aa-bb  转为aaBb
    camelCase: function(str) {
        return str.replace(/\-(\w)/g, function(match, letter){
            return letter.toUpperCase();
        })
    },
    trim: function(str) {
        return str.replace(/^\s+|\\s+$/, '')
    }
})

A.fn.extend({
    on : function(type, fn, data) {
        var i = this.length;
        for(;--i>=0;) {
            compatibleLib._on(this[i], type, fn, data)
        }
        return this;
    },
    css: function() {
        var arg = arguments,
            len = arguments.length;
        if (this.length < 1) {
            return this;
        }
        var i = this.length - 1;
        // 一个参数: string--获取对应属性值；object--设置key的值为value
        if(len === 1) {
            // return _getStyle(this[0], arg[0]);
            if(typeof arg[0] === "string") {
                return compatibleLib._getStyle(this[0], arg[0]);
            } else if(typeof arg[0] === "object") {
                for(var keyName in arg[0]) {
                    for(;i >=0;i --) {
                        this[i].style[A.camelCase(keyName)] = arg[0][keyName];
                    }
                }
            }
        }else if(len === 2) {
            for(;i >= 0;i --) {
                this[i].style[A.camelCase(arg[0])] = arg[1];
            }
        }else {
            throw new Error('Parameter error')
        }
        return this;
    },
    html: function() {
        var arg = arguments,
            len = arguments.length,
            domLen = this.length,
            i = domLen - 1;
        if(domLen < 1) {
            return this;
        }
        if(len === 0) {
            return this[0].innerHTML;
        }else if(len === 1) {
            for(;i >= 0;i --) {
                this[i].innerHTML = arg[0];
            }
        }else if(len === 2 && arg[1]) {
            for(;i >= 0;i --) {
                this[i].innerHTML += arg[0];
            }
        }
        return this;
    },
    hasClass: function(val) {
        if(!this[0]){
            return;
        }
        var value = A.trim(val);
        return this[0].className && this[0].className.indexOf(value) >= 0 ? true : false;
    },
    addClass: function(val) {
        var value = A.trim(val),
            str = '';
        for(var i = 0;i < this.length; i++) {
            str = this[i].className;
            if(!~str.indexOf(value)) {
                this[i].className += ' ' + value;
            }
        }
        return this;
    },
    removeClass: function(val) {
        var value = A.trim(val),
        classNameArr,
            result;
        for(var i = 0;i < this.length;i ++) {
            if(this[i].className && ~this[i].className.indexOf(value)) {
                classNameArr = this[i].className.split(' ');
                result = '';

                for(var j = classNameArr.length - 1;j >=0; j --) {
                    classNameArr[j] = A.trim(classNameArr[j]);
                    result += classNameArr[j] && classNameArr[j] !== value ? ' ' + classNameArr[j] : '';
                }
                this[i].className = result;
            }
        }
        return this;
    },

    toggleClass: function() {
        // console.log(this)
        if (this.length < 1) {
            return
        }
        var arg = arguments,
            value = '';
        if(arg.length === 1) {
            value = A.trim(arg[0]);
            for(var i = 0;i < this.length;i ++) {

                if(this[i].className && ~this[i].className.indexOf(value)) {
                    var classArr = [];
                    var res = '';
                    classArr = this[i].className.split(' ');
                    for(var j = classArr.length - 1;j >= 0;j --) {
                        classArr[j] = A.trim(classArr[j]);
                        res += classArr[j] && classArr[j] !== value ? ' ' + classArr[j] : '';
                    }
                    this[i].className = A.trim(res);
                }else {
                    this[i].className += ' ' + A.trim(value);
                }
            }
        }
        return this;
    },

    get: function(index) {
        if(typeof index !== 'number') {
            throw new Error('Parameter error')
        }else {
            return this[index];
        }
    },

    eq: function (index) {
        if(typeof index !== 'number') {
            throw new Error('Parameter error')
        }else {
            return A(this[index]);
        }
    },

    attr: function() {
        var arg = arguments,
            len = arg.length;
        if(this.length < 1) {
            return this;
        }
        if(len === 1) {
            if(typeof arg[0] === 'string') {
                return this[0].getAttribute(arg[0])
            }else if(typeof arg[0] === 'object') {
                for(var i in arg[0]) {
                    for(var j = this.length - 1;j >=0;j --) {
                        this[j].setAttribute(i, arg[0][i]);
                    }
                }
            }
        }else if(len === 2) {
            for(var j = this.length - 1;j >=0;j --) {
                this[j].setAttribute(arg[0], arg[1])
            }
        }
        return this;
    }
})
