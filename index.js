import jsFileDownload from 'js-file-download'
import CryptoJS from 'crypto-js'

(function (factory) {
    "use strict";
    module.exports = factory()
})(function () {
    "use strict";
    let Great = {
        //数组转树形1
        arrayToTree(data) {
            const result = [];
            const map = {};

            data.forEach((item) => {
                map[item.id] = { ...item, children: [] };
            });

            data.forEach((item) => {
                if (map[item.parentId]) {
                    map[item.parentId].children.push(map[item.id]);
                } else {
                    result.push(map[item.id]);
                }
            });
            return result;
        },
        // 深克隆2
        deepClone(source) {
            if (!source || typeof source !== 'object') {
                return source
            }
            const targetObj = source.constructor === Array ? [] : {};
            Object.keys(source).forEach(keys => {
                if (source[keys] && typeof source[keys] === 'object') {
                    targetObj[keys] = this.deepClone(source[keys]);
                } else {
                    targetObj[keys] = source[keys];
                }
            });
            return targetObj;
        },
        // 防抖3
        debounce(func, wait = 1000, immediate = false) {
            let timeout;
            let isInvoke = false; //记录立即执行是否已执行过
            return function (...args) {
                const context = this; // 保存函数执行时的上下文
                // 清除现有定时器，防止上次延迟执行的操作被执行
                clearTimeout(timeout);
                // immediate为true时，且timeout未设置（第一次调用或immediate模式下刚执行过）
                // 立即执行函数
                if (immediate && !isInvoke) {
                    func.apply(context, args);
                    isInvoke = true
                } else {
                    // 设置新的定时器，延迟执行func
                    timeout = setTimeout(function () {
                        // 如果immediate为false，则在这里执行func
                        func.apply(context, args);
                        // 没有这个步骤时，只有第一次输入是立即执行，即使后面延迟执行后再输入也是延迟执行
                        isInvoke = true
                        // 执行完毕后清空timeout，防止内存泄漏
                        timeout = null;
                    }, wait);
                }
            };
        },
        //url参数转变为obj4
        urlParamsToObj(url) {
            const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')   // 未转义前的url中+号表示空格,要替换掉
            if (!search) {
                return {}
            }
            const obj = {}
            const searchArr = search.split('&')
            searchArr.forEach(v => {
                const index = v.indexOf('=')
                if (index !== -1) {
                    const name = v.substring(0, index)
                    const val = v.substring(index + 1, v.length)
                    obj[name] = val
                }
            })
            return obj
        },
        // 得到两个数组的并集, 两个数组的元素为数值或字符串5
        unionArr(arr1, arr2) {
            return [...new Set([...arr1, ...arr2])];
        },
        //数字字符串转换为带千分位的数字'8857646'=>'8,857,646.00'   6
        numberFormat(number, decimals, dec_point, thousands_sep) {
            /*
             * 参数说明：
             * number：要格式化的数字
             * decimals：保留几位小数
             * dec_point：小数点符号
             * thousands_sep：千分位符号
             * */
            number = Math.round(number * 100) / 100;
            number = (number + '').replace(/[^0-9+-Ee.]/g, '');
            let n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
                dec = typeof dec_point === 'undefined' ? '.' : dec_point,
                s = '',
                toFixedFix = function (n, prec) {
                    let k = Math.pow(10, prec);
                    return '' + Math.round(n * k) / k;
                };
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
            let re = /(-?\d+)(\d{3})/;
            while (re.test(s[0])) {
                s[0] = s[0].replace(re, '$1' + sep + '$2');
            }

            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        },
        // 金额数字转文字,处理成两位小数，处理带逗号的情况，例如（999,785.05)  7
        moneyNumberToText(number) {
            if (number === 0 || number === '0') {
                return '零';
            }
            let AA = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
            let BB = ['', '拾', '佰', '仟', '萬', '亿'];
            let CC = ['角', '分'];
            // 处理小数点后的角，分
            let deciStr = (number + '').split('.')[1]
            let resStr = ''
            if (deciStr) {
                deciStr.substring(0, 2).split('').forEach((item, i) => {
                    resStr += AA[item * 1] + CC[i]
                })
            }
            //   处理整数部分
            let reverseStr = (number + '')
                .split('.')[0]
                .split('')
                .reverse()
                .join('');
            let result = '';
            let unit = 0;
            reverseStr.replace(/\d{1,4}/g, function ($1) {
                if (unit !== 0) {
                    if (unit % 2 !== 0) {
                        $1 = BB[4] + $1;
                    } else {
                        $1 = BB[5] + $1;
                    }
                }
                $1 = $1.replace(/\d/g, function (x1, idx) {
                    if (x1 !== '0') {
                        let idx1 = unit > 0 ? idx - 1 : idx;
                        return BB[idx1] + AA[x1];
                    } else {
                        return AA[x1];
                    }
                });
                result += $1;
                unit += 1;
            });
            result = result
                .replace(/[零]{2,}/g, function () {
                    return '零';
                })
                .split('')
                .reverse()
                .join('');

            result = result
                .replace(/(零仟)|(零拾)/g, function () {
                    return '';
                })
                .replace(/(零亿)|(零亿零萬)/g, function () {
                    return '亿';
                })
                .replace(/(零萬)/g, function () {
                    return '萬';
                })
                .replace(/零$/, function () {
                    return '';
                });

            result += '圆';
            return result;
        },
        /**
         * js-file-download下载 Blob 文件8
         * @param {Blob} blob
         * @param {String} fileName
         */
        fileBlobDownload(blob, name) {
            jsFileDownload(blob, name)

        },
        // crypto-js加密9
        encrypt(word, keyStr) {
            keyStr = keyStr || 'abcdefgabcdefg123456'
            var key = CryptoJS.enc.Utf8.parse(keyStr) // Latin1 w8m31+Yy/Nw6thPsMpO5fg==
            var srcs = CryptoJS.enc.Utf8.parse(word)
            var encrypted = CryptoJS.AES.encrypt(srcs, key, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            })
            return encrypted.toString()
        },
        // crypto-js解密10
        decrypt(word, keyStr) {
            keyStr = keyStr || 'abcdefgabcdefg123456'
            var key = CryptoJS.enc.Utf8.parse(keyStr) // Latin1 w8m31+Yy/Nw6thPsMpO5fg==
            var decrypt = CryptoJS.AES.decrypt(word, key, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            })
            return CryptoJS.enc.Utf8.stringify(decrypt).toString()
        },
        // 判断字符是否为汉字，11
        isChinese(s) {
            return /[\u4e00-\u9fa5]/.test(s);
        },
        /**
         * 首字母大写 12
         */
        firstUpperCase(str) {
            return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
        },
        /**
         * 生成随机字符串 13
         */
        toAnyString() {
            const str = 'xxxxx-xxxxx-4xxxx-yxxxx-xxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0
                const v = c === 'x' ? r : (r & 0x3) | 0x8
                return v.toString()
            })
            return str
        },
        /**
         * 格式化时间 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss 14
         * @param {Date | number | string} time 需要转换的时间
         * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
         */
        formatTime(time, fmt) {
            if (!time) return ''
            else {
                const date = new Date(time)
                const o = {
                    'M+': date.getMonth() + 1,
                    'd+': date.getDate(),
                    'H+': date.getHours(),
                    'm+': date.getMinutes(),
                    's+': date.getSeconds(),
                    'q+': Math.floor((date.getMonth() + 3) / 3),
                    S: date.getMilliseconds()
                }
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
                }
                for (const k in o) {
                    if (new RegExp('(' + k + ')').test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
                        )
                    }
                }
                return fmt
            }
        },
        /**
        * * JSON序列化，支持函数和 undefined,undefined返回null 15
        * @param data
        */
        JSONStringify(data) {
            return JSON.stringify(
                data,
                (key, val) => {
                    // 处理函数丢失问题
                    if (typeof val === 'function') {
                        return `${val}`
                    }
                    // 处理 undefined 丢失问题
                    if (typeof val === 'undefined') {
                        return null
                    }
                    return val
                },
                2
            )
        },
        /**
        * * JSON反序列化，支持函数和 undefined 16
        * @param data
        */
        JSONParse(data) {
            let excludeParseEventKeyList = ['filter', 'vnodeMounted', 'vnodeBeforeMount', 'click', 'dblclick', 'mouseenter', 'mouseleave']
            // 请求里的函数语句
            let excludeParseEventValueList = ['javascript:']
            const evalFn = (fn) => {
                var Fun = Function // 一个变量指向Function，防止前端编译工具报错
                return new Fun('return ' + fn)()
            }
            return JSON.parse(data, (k, v) => {
                // 过滤函数字符串
                if (excludeParseEventKeyList.includes(k)) return v
                // 过滤函数值表达式
                if (typeof v === 'string') {
                    const someValue = excludeParseEventValueList.some(excludeValue => v.indexOf(excludeValue) > -1)
                    if (someValue) return v
                }
                // 还原函数值
                if (typeof v === 'string' && v.indexOf && (v.indexOf('function') > -1 || v.indexOf('=>') > -1)) {
                    return evalFn(`(function(){return ${v}})()`)
                } else if (typeof v === 'string' && v.indexOf && v.indexOf('return ') > -1) {
                    const baseLeftIndex = v.indexOf('(')
                    if (baseLeftIndex > -1) {
                        const newFn = `function ${v.substring(baseLeftIndex)}`
                        return evalFn(`(function(){return ${newFn}})()`)
                    }
                }
                return v
            })
        },
        // 页面添加水印效果  17
        setWatermark(str) {
            const id = '1.23452384164.123412416';
            if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
            const can = document.createElement('canvas');
            can.width = 200;
            can.height = 130;
            const cans = can.getContext('2d');
            cans.rotate((-20 * Math.PI) / 180);
            cans.font = '12px Vedana';
            cans.fillStyle = 'rgba(200, 200, 200, 0.30)';
            cans.textBaseline = 'middle';
            cans.fillText(str, can.width / 10, can.height / 2);
            const div = document.createElement('div');
            div.id = id;
            div.style.pointerEvents = 'none';
            div.style.top = '0px';
            div.style.left = '0px';
            div.style.position = 'fixed';
            div.style.zIndex = '10000000';
            div.style.width = `${document.documentElement.clientWidth}px`;
            div.style.height = `${document.documentElement.clientHeight}px`;
            div.style.background = `url(${can.toDataURL('image/png')}) left top repeat`;
            document.body.appendChild(div);
            return id;
        },
        /**
         * 页面添加删除水印效果  18
         * @method set 设置水印
         * @method del 删除水印
         */
        watermark: {
            // 设置水印
            set: (str) => {
                let id = Great.setWatermark(str);
                if (document.getElementById(id) === null) id = Great.setWatermark(str);
            },
            // 删除水印
            del: () => {
                let id = '1.23452384164.123412416';
                if (document.getElementById(id) !== null) document.body.removeChild(document.getElementById(id));
            },
        },

    };
    return Great;
});