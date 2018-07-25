const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const url = require('url');
const path = require('path');
const request = require('./service').request;
const AipSpeechClient = require("baidu-aip-sdk").speech;
// 语音合成
const AI_SPEECH_APP_ID = '11263085';
const AI_SPEECH_API_KEY = 'Qs0ucAF83w0xT93GI1jHRD5H';
const AI_SPEECH_SECRET_KEY = 'd00bc584aefb6d985d38a00d48da0ad2';
let aipSpeechClient = null;
const fs = require('fs');

let loginWin;
// 隐藏的打印窗口
let printWin;

// 隐藏的音乐播放窗口
let voiceWin;

// 订单窗口,需要时打开
let orderWin = null;
app.on('ready', () => {
    loginWin = new BrowserWindow({
        backgroundColor: '#e0e0e0', width: 430, height: 320, show: false, frame: false, resizable: false, webPreferences: {
            webSecurity: false
        }
    });
    loginWin.loadURL(url.format({
        pathname: path.join(__dirname, "/dist/login.html"),
        protocol: "file:",
        slashes: true
    }));

    loginWin.once('ready-to-show', () => {
        loginWin.show();
        loginWin.setMovable(true);
        // loginWin.webContents.openDevTools();
    });

    // 打印窗口
    printWin = new BrowserWindow({
        show: false
    });
    printWin.loadURL(url.format({
        pathname: path.join(__dirname, "/dist/ticket.html"),
        protocol: "file:",
        slashes: true
    }));
    printWin.on('close', () => {
        printWin = null;
    });

    // 音乐播放窗口
    // audio-ready
    voiceWin = new BrowserWindow({
        show: false
    });
    voiceWin.loadURL(url.format({
        pathname: path.join(__dirname, "/dist/voice.html"),
        protocol: "file:",
        slashes: true
    }));
    voiceWin.on('close', () => {
        voiceWin = null;
    });
});


// 连接页面
let connectedWin = null;
//托盘对象
let appTray = null;
// 连接到IOT
const mqtt = require('mqtt');
const crypto = require('crypto');
let iotClient = null;
let isConnected = false;
ipcMain.on('page:connected', (event, args) => {
    if (connectedWin == null) {
        connectedWin = new BrowserWindow({
            backgroundColor: '#e0e0e0', width: 430, height: 320, show: false, frame: false, resizable: false,
            webPreferences: {
                webSecurity: false
            }
        });
        connectedWin.loadURL(url.format({
            pathname: path.join(__dirname, "/dist/connected.html"),
            protocol: "file:",
            slashes: true
        }));
        connectedWin.once('ready-to-show', () => {
            connectedWin.show();
            connectedWin.setMovable(true);
            // connectedWin.webContents.openDevTools();
        });
        connectedWin.on('close', () => {
            connectedWin = null;
        });
        // 创建托管菜单
        const trayMenu = [
            {
                label: '查看订单',
                click() {
                    orderPageShow();
                }
            },
            {
                label: '退出',
                click() {
                    closeApp();
                }
            }
        ];
        //设置图标
        appTray = new Tray(path.join(__dirname, '../assets/icons/win/icon.ico'));
        //设置此托盘图标的悬停提示内容
        appTray.setToolTip('品珍商城');
        //图标的上下文菜单
        const contextMenu = Menu.buildFromTemplate(trayMenu);
        appTray.setContextMenu(contextMenu);
        //单点击 1.主窗口显示隐藏切换 2.清除闪烁
        appTray.on("click", function () {
            //主窗口显示隐藏切换
            connectedWin.isVisible() ? connectedWin.hide() : connectedWin.show();
        });

    } else {
        if (!connectedWin.isVisible()) {
            connectedWin.show();
        }
    }
    if (!!loginWin) {
        loginWin.close();
        loginWin = null;
    }

    //以下是IOT连接信息
    if (iotClient == null) {
        const deviceInfo = args;
        const productKey = deviceInfo.product_key;
        const clientId = deviceInfo.iot_id;
        const deviceName = deviceInfo.device_name;
        const deviceSecret = deviceInfo.device_secret;
        const timestamp = new Date().getTime();

        // 连接域名
        const conn_url = `ws://${productKey}.iot-as-mqtt.cn-shanghai.aliyuncs.com:443`;
        const mqttClientId = `${clientId}|securemode=3,signmethod=hmacsha1,timestamp=${timestamp}|`;
        const mqttUsername = `${deviceName}&${productKey}`;
        // 连接密码
        const mqttPasswrod = crypto.createHmac('sha1', deviceSecret)
            .update(`clientId${clientId}deviceName${deviceName}productKey${productKey}timestamp${timestamp}`).digest('hex');
        iotClient = mqtt.connect(conn_url, {
            clientId: mqttClientId,
            username: mqttUsername,
            password: mqttPasswrod
        });


        iotClient.on('connect', function () {
            // 订阅get类型的topic
            iotClient.subscribe(`/${productKey}/${deviceName}/get`);

            // 给网页发送信息
            isConnected = true;
            connectedWin.webContents.send('connected', {
                isConnected: true,
                connecting: false
            });


            // 向update类型的topic发送消息
            // iotClient.publish(`/${productKey}/${deviceName}/update`, 'hello, World~~~~');
        });

        iotClient.on('error', error => {
            console.log(error);
            iotClient.end();
            isConnected = false;
            connectedWin.webContents.send('connected', {
                isConnected: false,
                connecting: false
            });
        });

        iotClient.on('message', function (topic, message) {
            console.log(`topic: ${topic},message: ${message.toLocaleString()}`);
            // 这里获取推送信息
            try {
                let voicePath = path.join(__dirname, './dist/tip.mp3');
                //判断音频文件是否存在
                fs.exists(voicePath, (exists) => {
                    if (exists) {
                        voiceWin && voiceWin.webContents.send('audio-ready', voicePath);
                    }
                    if (!exists) {
                        // 语音合成API
                        if (!aipSpeechClient) {
                            aipSpeechClient = new AipSpeechClient(AI_SPEECH_APP_ID, AI_SPEECH_API_KEY, AI_SPEECH_SECRET_KEY);
                            // 语音合成
                            aipSpeechClient.text2audio('您有新的品珍商城订单,请及时处理', { vol: 15 }).then(function (result) {
                                if (result.data) {
                                    fs.writeFile(voicePath, result.data, (err) => {
                                        if (!err) {
                                            // 播放音频
                                            voiceWin.webContents.send('audio-ready', voicePath);
                                        }
                                    });
                                } else {
                                    // 服务发生错误
                                    console.log(result)
                                }
                            }, function (e) {
                                // 发生网络错误
                                console.log(e)
                            });

                        }
                    }
                });

                const msgObjH = JSON.parse(message);
                if (!msgObjH) return;
                const msgObj = JSON.parse(msgObjH.message);
                if (msgObj && msgObj.type == 'mall_order') {
                    if (Notification.isSupported()) {
                        let notification = new Notification({
                            title: '品珍鲜活',
                            body: `您有新的品珍商城订单,请及时处理。`,
                            icon: path.join(__dirname, '../assets/icons/logo.jpg')
                        });
                        notification.show();
                        notification.on('close', () => {
                            notification = null;
                        });
                    }

                    // 类型为商城订单
                    const orderObj = msgObj.order;
                    if (!!orderObj) {
                        // 把商城订单发送到小票打印页面
                        if (!!printWin) {
                            // 获取商城订单
                            request({
                                url: `/serp/v1/iot/gitMallOrder?order_id=${orderObj.order_id}&order_no=${orderObj.order_no}`
                            }).then((resp) => {
                                if (resp.status === 0) {
                                    console.log('order --> ' + resp.data.order);
                                    printWin.webContents.send('bill-update', {
                                        order: resp.data.order
                                    });
                                    // 必须设置!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                    needPrint = true;
                                }
                                resp.message && console.log(resp.message);
                            }).catch(e => {
                                console.log(e);
                            });
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }


            if (message.toString() === 'finish') {
                iotClient.end();
                isConnected = false;
                connectedWin.webContents.send('connected', {
                    isConnected: false,
                    connecting: false
                });
            }
        });
    }
});

ipcMain.on('bill-reprint', (event, args) => {
    printWin && printWin.webContents.send('bill-update', {
        order: args.order
    });
    // 必须设置!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    needPrint = true;
});

const closeApp = () => {
    loginWin && loginWin.close();
    loginWin = null;
    aipSpeechClient = null;

    //关闭IOT连接
    if (!!iotClient && iotClient.connected) {
        iotClient.end();
        console.log('finish iot client');
    }
    printerSetWin && printerSetWin.close();
    printerSetWin = null;
    connectedWin && connectedWin.close();
    connectedWin = null;
    appTray && appTray.destroy();
    printWin && printWin.close();
    printWin = null;
    app.quit();
};


ipcMain.on('close', (event, args) => {
    // let focuseWin = BrowserWindow.getFocusedWindow();
    // focuseWin && focuseWin.close();
    closeApp();
});


ipcMain.on('minToTray', (event, args) => {
    let focuseWin = BrowserWindow.getFocusedWindow();
    if (focuseWin) {
        focuseWin.hide();
        focuseWin.setSkipTaskbar(true);
    }
});

//关闭当前窗口
ipcMain.on('close-current', (event, args) => {
    let focuseWin = BrowserWindow.getFocusedWindow();
    focuseWin && focuseWin.close();
});

// IOT是否连接了
ipcMain.on('isConnected', (event, args) => {
    connectedWin && connectedWin.webContents.send('connected', {
        isConnected: isConnected,
        connecting: !isConnected
    });
});

// IOT断开连接
ipcMain.on('iot-disconnect', (event, args) => {
    //关闭IOT连接
    if (!!iotClient && iotClient.connected) {
        iotClient.end();
        isConnected = false;
        console.log('finish iot client');
    }
    connectedWin && connectedWin.webContents.send('connected', {
        isConnected: isConnected,
        connecting: false
    });
});
// IOT重新连接
ipcMain.on('iot-reconnect', (event, args) => {
    if (!!iotClient && !iotClient.connected) {
        iotClient.reconnect();
        isConnected = true;
        console.log('reconnect iot client');
    }
});

// ------------------打印机设置页面---------------------------------
let printerSetWin = null;
ipcMain.on('page:printer', (event) => {
    if (!printerSetWin) {
        printerSetWin = new BrowserWindow({
            backgroundColor: '#e0e0e0', width: 480, height: 380, show: false, frame: false, resizable: false, webPreferences: {
                webSecurity: false
            }, parent: connectedWin
        });
        printerSetWin.loadURL(url.format({
            pathname: path.join(__dirname, "/dist/printer.html"),
            protocol: "file:",
            slashes: true
        }));
        printerSetWin.once('ready-to-show', () => {
            printerSetWin.show();
            printerSetWin.setMovable(true);
            // printerSetWin.webContents.openDevTools();
        });
        printerSetWin.on('close', (event) => {
            printerSetWin = null;
        });
    } else {
        if (!printerSetWin.isVisible()) {
            printerSetWin.show();
        }
    }
});

// 向打印页面发送要打印的信息(接收print-test并向打印页面发bill-update)
ipcMain.on('print-test', (event, args) => {
    console.log('git print test command: ' + JSON.stringify(args));
    if (!!printWin) {
        printWin.webContents.send('bill-update', args);
        // 必须设置!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        needPrint = true;
    }
});



// ----------------接收来自打印页面的打印命令（打印页面更新完毕）-------------------------
let needPrint = false;
ipcMain.on('print-bill', (event, arg) => {
    console.log('git print bill command: ' + JSON.stringify(arg));
    if (!needPrint) return;
    needPrint = false;
    if (!!printWin) {
        const contents = printWin.webContents;
        let checkPrinter = arg;
        if (!arg) {
            const printers = contents.getPrinters();
            let defaultPrint = null;
            printers.forEach((p, i) => {
                if (p.isDefault) {
                    console.log(`i = ${i}`);
                    defaultPrint = p;
                }
            });
            checkPrinter = defaultPrint && defaultPrint.name;
        }
        if (checkPrinter) {
            console.log('begin-print:' + checkPrinter);
            contents.print({
                silent: true,
                deviceName: checkPrinter
            }, (success) => {
                success && console.log('success!!!!');
                contents.stopPainting();
            });
        }
    }
});


// 获取打印机
ipcMain.on('getPrinters', (event, arg) => {
    let focuseWin = BrowserWindow.getFocusedWindow();
    const contents = focuseWin.webContents;
    const printObjs = contents.getPrinters();
    const printers = [];
    let defaultPrinter = '';
    printObjs.forEach((p, i) => {
        printers.push(p.name);
        if (p.isDefault) {
            defaultPrinter = p.name;
        }
    });

    event.returnValue = {
        printers,
        defaultPrinter
    };
});

ipcMain.on('minimize', (event) => {
    let focuseWin = BrowserWindow.getFocusedWindow();
    focuseWin && focuseWin.minimize();
});

// 打开订单页面
const orderPageShow = () => {
    if (!orderWin) {
        orderWin = new BrowserWindow({
            backgroundColor: '#e0e0e0', show: false, frame: false, resizable: false, movable: false, webPreferences: {
                webSecurity: false
            }
        });
        orderWin.loadURL(url.format({
            pathname: path.join(__dirname, "/dist/order.html"),
            protocol: "file:",
            slashes: true
        }));

        orderWin.once('ready-to-show', () => {
            orderWin.maximize();
            orderWin.show();
            // orderWin.webContents.openDevTools();
        });

        orderWin.once('close', () => {
            orderWin = null;
        });
    } else {
        orderWin.show();
    }
};
//关闭订单页面
const orderPageClose = () => {
    if (!!orderWin) {
        orderWin.hide();
    }
};
//销毁订单页面
const orderPageDestroy = () => {
    if (!!orderWin) {
        orderWin.close();
    }
};

ipcMain.on('page:order', (event) => {
    orderPageShow();
});