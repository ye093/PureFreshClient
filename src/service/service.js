const net = require('electron').remote.net;


/*
method String (可选) - HTTP请求方法. 默认为GET方法.
url String (可选) - 请求的URL. 必须在指定了http或https的协议方案的独立表单中提供.
session Object (可选) - 与请求相关联的Session实例.
partition String (可选) - 与请求相关联的partition名称. 默认为空字符串. session选项优先于partition选项. 因此, 如果session是显式指定的, 则partition将被忽略.
protocol String (可选) - 在"scheme:"表单中的协议方案. 目前支持的值为'http:' 或者'https:'. 默认为'http:'.
host String (可选) - 作为连接提供的服务器主机,主机名和端口号'hostname:port'.
hostname String (可选) - 服务器主机名.
port Integer (可选) - 服务器侦听的端口号.
path String (可选) - 请求URL的路径部分.
redirect String (可选) - 请求的重定向模式. 可选值为 follow, error 或 manual. 默认值为 follow. 当模式为error时, 重定向将被终止. 当模式为 manual时，表示延迟重定向直到调用了 
*/
export async function request({ method, url, params, header }) {

    return new Promise((resolve, reject) => {
        const req = net.request({
            method: method || 'GET',
            url: url
        });
        req.setHeader('Content-Type', 'application/json');

        // 等待响应20秒超时
        let timerId = setTimeout(() => {
            req.abort();
            req.emit("timeout");
        }, 20000);

        header && header.name && header.value && req.setHeader(header.name, header.value);

        req.on('timeout', () => {
            console.log('timeout');
            timerId && clearTimeout(timerId);
            timerId = null;
        });

        req.on('response', (res) => {
            timerId && clearTimeout(timerId);
            timerId = null;
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                resolve(JSON.parse(chunk));
            });
            if (res.statusCode >= 400) {
                reject(res.statusCode);
            }
        });
        req.on('error', (e) => {
            timerId && clearTimeout(timerId);
            timerId = null;
            console.log('error->' + e);
            reject(e);
        });
        params && req.write(JSON.stringify(params), 'UTF-8');
        req.end();
    }).catch(e => {
        console.log(e);
    });
}