import jsFileDownload from 'js-file-download'
import CryptoJS from 'crypto-js';
export interface IObject {
    [key: string]: any
}
//树形接口
export interface TreeNode<T> {
    id: string | number;
    parentId?: string | number;
    children?: Array<TreeNode<T>>;
    [key: string]: any; // 其他可能存在的属性
}

// 数组转树形1  
function arrayToTree<T>(flatData: Array<{ id: string | number, parentId: string | number | null, [key: string]: any; }>): TreeNode<T>[] {
    const tree: Record<string | number, TreeNode<T>> = {};
    const result: TreeNode<T>[] = [];

    flatData.forEach(item => {
        tree[item.id] = { ...item, children: [] } as TreeNode<T>;
    });

    flatData.forEach(item => {
        if (tree[item.parentId]) {
            tree[item.parentId].children?.push(tree[item.id]);
        } else {
            result.push(tree[item.id]);
        }
    });

    return result;
}
// 深克隆2
function deepClone(source: any) {
    if (!source || typeof source !== 'object') {
        return source
    }
    const targetObj: any = source.constructor === Array ? [] : {};
    Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
            targetObj[keys] = deepClone(source[keys]);
        } else {
            targetObj[keys] = source[keys];
        }
    });
    return targetObj;
}
// 防抖3
export type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;
function debounce<T extends (...args: any[]) => any>(func: T, wait: number = 1000, immediate?: boolean = false): DebouncedFunction<T> {
    let timeout: NodeJS.Timeout | null = null;
    let isInvoke: boolean = false; //记录立即执行是否已执行过
    return function (...args: Parameters<T>): void {
        const context = this;
        if (timeout !== null) {
            clearTimeout(timeout);
        }

        if (immediate && !isInvoke) {
            // 立即执行函数，并设置一个空的timeout避免连续触发
            func.apply(context, args);
            isInvoke = true;
        } else {
            // 设置一个新的定时器，延迟执行func
            timeout = setTimeout(() => {
                func.apply(context, args);
                // 没有这个步骤时，只有第一次输入是立即执行，即使后面延迟执行后再输入也是延迟执行
                isInvoke = true
                timeout = null;
            }, wait);
        }
    };
}
//url参数转变为obj4
function urlParamsToObj(url: string): Record<string, string> {
    const search = decodeURIComponent(url.split('?')[1] ?? '').replace(/\+/g, ' '); // 未转义前的url中+号表示空格，要替换掉
    if (!search) {
        return {} as Record<string, string>;
    }
    const obj: Record<string, string> = {};
    const searchArr: IObject[] = search.split('&');
    searchArr.forEach((v) => {
        const index = v.indexOf('=');
        if (index !== -1) {
            const name = v.substring(0, index);
            const val = v.substring(index + 1, v.length);
            obj[name] = val;
        }
    });
    return obj;
}
// 得到两个数组的并集, 两个数组的元素为数值或字符串5
function unionArr(arr1: string | number[], arr2: string | number[]) {
    return [...new Set([...arr1, ...arr2])];
}
//数字字符串转换为带千分位的数字'8857646'=>'8,857,646.00'   6
function numberFormat(number: number, decimals?: number, dec_point?: string, thousands_sep?: string): string {
    // 参数说明：
    // number：要格式化的数字
    // decimals：保留几位小数，默认为0
    // dec_point：小数点符号，默认为'.'
    // thousands_sep：千分位符号，默认为','
    number = Math.round(number * 100) / 100;
    number = number.toString().replace(/[^0-9+-Ee.]/g, '');
    let n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(decimals !== undefined ? decimals : 0) ? decimals : 0) : Math.abs(decimals),
            sep = thousands_sep !== undefined ? thousands_sep : ',',
            dec = dec_point !== undefined ? dec_point : '.',
            s = '',
            toFixedFix = function (n: number, prec: number) {
                let k = Math.pow(10, prec);
                return '' + Math.round(n * k) / k;
            };
    s = (prec ? toFixedFix(n, prec) : n.toString()).split('.');
    let re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
        s[0] = s[0].replace(re, '$1' + sep + '$2');
    }

    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - (s[1].length || 0) + 1).join('0');
    }
    return s.join(dec);
}
//金额数字转文字7
function moneyNumberToText(number: number | string): string {
    if (number === 0 || number === '0') {
        return '零圆';
    }
    let AA: string[] = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    let BB: string[] = ['', '拾', '佰', '仟', '萬', '亿'];
    let CC = ['角', '分'];
    // 处理小数点后的角，分
    let deciStr = (number + '').split('.')[1]
    let resStr = ''
    if (deciStr) {
        deciStr.substring(0, 2).split('').forEach((item, i) => {
            resStr += AA[item * 1] + CC[i]
        })
    }
    let reverseStr = (number + '')
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
        .replace(/(零仟)|(零拾)/g, '')
        .replace(/(零亿)|(零億零萬)/g, '億')
        .replace(/(零萬)/g, '萬')
        .replace(/零$/, '');

    result += '圆';
    return result;
}
// js-file-download文件下载8 
// {Blob} blob
// {String} fileName
function fileBlobDownload(blob: Blob, fileName: string): void {
    jsFileDownload(blob, fileName)

}
//crypto-js加密9
function encrypt(word: string, keyStr?: string): string {
    keyStr = keyStr || 'abcdefgabcdefg123456'; // Default key if not provided
    const key = CryptoJS.enc.Utf8.parse(keyStr); // Key parsing
    const srcs = CryptoJS.enc.Utf8.parse(word); // Message parsing

    // Encrypting the message using AES with ECB mode and PKCS7 padding
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // Returning the encrypted message as a string
    return encrypted.toString();
}
//crypto-js解密10
function decrypt(ciphertext: string, keyStr?: string): string {
    keyStr = keyStr || 'abcdefgabcdefg123456'; // Default key if not provided
    const key = CryptoJS.enc.Utf8.parse(keyStr); // Key parsing

    // Decrypting the ciphertext using AES with ECB mode and PKCS7 padding
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // Converting the decrypted ciphertext back to a UTF-8 string and returning it
    return CryptoJS.enc.Utf8.stringify(decrypted);
}
// 判断字符是否为汉字11
function isChinese(s: string) {
    return /[\u4e00-\u9fa5]/.test(s);
}
/**
 * 首字母大写12
 */
function firstUpperCase(str: string) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
}
/**
* 生成随机字符串13
*/
function toAnyString() {
    const str: string = 'xxxxx-xxxxx-4xxxx-yxxxx-xxxxx'.replace(/[xy]/g, (c: string) => {
        const r: number = (Math.random() * 16) | 0
        const v: number = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString()
    })
    return str
}
/**
 * 格式化时间 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss  14
 * @param {Date | number | string} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
function formatTime(time: Date | number | string, fmt: string) {
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
}
/**
* * JSON序列化，支持函数和 undefined,undefined返回null 15
* @param data
*/
export const JSONStringify = <T>(data: T) => {
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
}
export const evalFn = (fn: string) => {
    var Fun = Function // 一个变量指向Function，防止前端编译工具报错
    return new Fun('return ' + fn)()
}
/**
* * JSON反序列化，支持函数和 undefined  16
* @param data
*/
export const JSONParse = (data: string) => {
    let excludeParseEventKeyList = ['filter', 'vnodeMounted', 'vnodeBeforeMount', 'click', 'dblclick', 'mouseenter', 'mouseleave']
    // 请求里的函数语句
    let excludeParseEventValueList = ['javascript:']
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
}
// 页面添加水印效果 17
const setWatermark = (str: string) => {
    const id = '1.23452384164.123412416';
    if (document.getElementById(id) !== null) document.body.removeChild(<HTMLElement>document.getElementById(id));
    const can = document.createElement('canvas');
    can.width = 200;
    can.height = 130;
    const cans = <CanvasRenderingContext2D>can.getContext('2d');
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
};

/**
 * 页面添加删除水印效果  18
 * @method set 设置水印
 * @method del 删除水印
 */
const watermark = {
    // 设置水印
    set: (str: string) => {
        let id = setWatermark(str);
        if (document.getElementById(id) === null) id = setWatermark(str);
    },
    // 删除水印
    del: () => {
        let id = '1.23452384164.123412416';
        if (document.getElementById(id) !== null) document.body.removeChild(<HTMLElement>document.getElementById(id));
    },
};

const Great = {
    arrayToTree,
    deepClone,
    debounce,
    urlParamsToObj,
    unionArr,
    numberFormat,
    moneyNumberToText,
    fileBlobDownload,
    encrypt,
    decrypt,
    isChinese,
    firstUpperCase,
    toAnyString,
    formatTime,
    JSONStringify,
    JSONParse,
    watermark,
    setWatermark
} as IObject
export default Great