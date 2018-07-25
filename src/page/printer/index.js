const ipcRenderer = require('electron').ipcRenderer;
import React from 'react';
import dva, { connect } from 'dva';
import { message } from 'antd';
import Printer from './routes/Printer';
const appData = require('../../util/AppData');
import createLoading from 'dva-loading';
import { printerSetting } from '../../service/api';

const app = dva();

app.use(createLoading());

app.model({
    namespace: 'printer',
    state: {
        printers: [],
        defaultPrinter: '',
        printWidth: 66
    },
    reducers: {
        close() {
            ipcRenderer && ipcRenderer.send('close-current');
        },
        minimize() {
            ipcRenderer && ipcRenderer.send('minimize');
        },
        sysPrinters(state) {
            if (ipcRenderer) {
                const storePri = appData.getPrinter();
                const printWidth = appData.getPaperWidth();
                const { printers, defaultPrinter } = ipcRenderer.sendSync('getPrinters');
                if (storePri && defaultPrinter != storePri) {
                    let hasV = false;
                    printers.forEach(e => {
                        if (e == storePri) {
                            hasV = true;
                        }
                    });
                    return {
                        printers,
                        defaultPrinter: hasV ? storePri : defaultPrinter,
                        printWidth: printWidth ? printWidth : 66
                    };
                } else {
                    return {
                        printers,
                        defaultPrinter,
                        printWidth: printWidth ? printWidth : 66
                    };
                }
            }
            return state;
        },
        printTest(state, { payload: values}) {
            // 打印测试
            ipcRenderer && ipcRenderer.send('print-test', values);

            return state;
        },
        saveRes(state, {payload: values }) {
            if (values.status === 0) {
                values.msg && message.success(values.msg);
            } else {
                values.msg && message.error(values.msg);
            }
            return state;
        }
    },
    effects: {
        // 保存打印信息
        *save({ payload }, { call, put }) {
            // 打印机名称
            const printer = payload.printer;
            // 打印纸大小（单位为mm）
            const paperWidth = payload.paperWidth;
            // 设备信息
            const iot_id = appData.getDevice().iot_id;
            const response = yield call(printerSetting, {
                printer,
                paperWidth,
                iot_id
            });
            yield put({
                type: 'saveRes',
                payload: response,
            });
            // 保存成功 successfully
            if (response.status === 0) {
                appData.setPrinter(printer);
                appData.setPaperWidth(paperWidth);
            }
        }
    }
});

const App = connect(({ printer }) => ({ printer }))(Printer);

app.router(() => <App />);

app.start('#root');