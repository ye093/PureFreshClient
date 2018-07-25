const ipcRenderer = require('electron').ipcRenderer;
import React from 'react';
import dva, { connect } from 'dva';
import Login from './routes/Login';
import { baseLogin } from '../../service/api';
const appData = require('../../util/AppData');
import createLoading from 'dva-loading';

const app = dva();

app.use(createLoading());

app.model({
    namespace: 'login',
    state: {
        flag: undefined,
        msg: undefined
    },
    reducers: {
        close(state) {
            ipcRenderer && ipcRenderer.send('close');
            return state;
        },
        minimize(state) {
            ipcRenderer && ipcRenderer.send('minimize');
            return state;
        },
        changeLoginStatus(state, { payload: values }) {
            return {
                flag: values.flag,
                msg: values.message
            };
        },
        jumpToMainPage(state) {
            if (appData.getIsMaster()) {
                //主组织用户跳转到监控主页

                ipcRenderer && ipcRenderer.send('page:connected');
            } else {
                //门店则跳转到连接页面
                const deviceInfo = appData.getDevice();
                deviceInfo && ipcRenderer && ipcRenderer.send('page:connected', {
                    device_name: deviceInfo.device_name,
                    iot_id: deviceInfo.iot_id,
                    product_key: deviceInfo.product_key,
                    device_secret: deviceInfo.device_secret
                });
            }
            return state;
        }
    },
    effects: {
        *login({ payload }, { call, put }) {
            const response = yield call(baseLogin, payload);
            // Login successfully
            if (response.flag) {
                appData.clearAll();
                response.user_name && appData.setUsername(response.user_name);
                response.is_master && appData.setIsMaster(response.is_master);
                response.device && appData.setDevice(response.device);
                response.device && response.device.printer &&  appData.setPrinter(response.device.printer);
                response.device && response.device.paper_width && appData.setPaperWidth(response.device.paper_width);
                yield put({
                    type: 'jumpToMainPage'
                });
            } else {
                yield put({
                    type: 'changeLoginStatus',
                    payload: response,
                });
            }
        }
    }
});

const App = connect(({ login }) => ({ login }))(Login);

app.router(() => <App />);

app.start('#root');