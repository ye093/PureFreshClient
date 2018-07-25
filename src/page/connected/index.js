const ipcRenderer = require('electron').ipcRenderer;
import React from 'react';
import dva, { connect } from 'dva';
import Connected from './routes/Connected';
import createLoading from 'dva-loading';

const app = dva();

app.use(createLoading());

app.model({
    namespace: 'connected',
    state: {
        code: undefined,
        msg: undefined
    },
    reducers: {
        minToTray(state) {
            ipcRenderer && ipcRenderer.send('minToTray');
            return state;
        },
        disConnect(state) {
            ipcRenderer && ipcRenderer.send('iot-disconnect');
            return state;
        },
        reConnect(state) {
            ipcRenderer && ipcRenderer.send('iot-reconnect');
            return state;
        },
        printerSetting(state) {
            ipcRenderer && ipcRenderer.send('page:printer');
            return state;
        },
        checkOrder(state) {
            ipcRenderer && ipcRenderer.send('page:order');
            return state;
        }
    }
});

const App = connect(({ connected }) => ({ connected }))(Connected);

app.router(() => <App />);

app.start('#root');