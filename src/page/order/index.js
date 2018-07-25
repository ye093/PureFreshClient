const ipcRenderer = require('electron').ipcRenderer;
import React from 'react';
import dva, { connect } from 'dva';
import { message } from 'antd';
import Order from './routes/Order';
import { gitEntOrder, gitOrderDetail, orderCancel, orderPost, mallOrderInfo, chgUpdateItemsSave,singleItemReturns } from '../../service/api';
import { getDevice, getUsername } from '../../util/AppData';

const app = dva();

app.model({
    namespace: 'order',
    state: {
        loading: false,
        page: {
            total: 0,
            pageSize: 10
        },
        data: [
        ]
    },
    reducers: {
        close(state) {
            ipcRenderer && ipcRenderer.send('close-current');
            return state;
        },
        minimize(state) {
            ipcRenderer && ipcRenderer.send('minimize');
            return state;
        },
        changeOrderHead(state, { payload: values }) {
            return values;
        },
        changeOrderLine(state, { payload: response }) {
            if (response.status === 0) {
                const orderLine = response.data;
                const nState = [];
                state.data.forEach((value) => {
                    if (value.order_head_id === response.id) {
                        nState.push({ ...value, order_line: orderLine });
                    } else {
                        nState.push(value);
                    }
                });
                return {
                    ...state,
                    data: nState
                };
            }
            return state;
        },
        changeOrderCancel(state, { payload: response }) {
            if (response.status === 0) {
                const nState = [];
                state.data.forEach((value) => {
                    if (value.order_head_id === response.id) {
                        nState.push({ ...value, status: '取消', order_line: null });
                    } else {
                        nState.push(value);
                    }
                });
                message.success(response.msg);
                return {
                    ...state,
                    data: nState
                };
            }
            message.error(response.msg);
            return state;
        },
        changeOrderPost(state, { payload: response }) {
            if (response.status === 0) {
                const nState = [];
                state.data.forEach((value) => {
                    if (value.order_head_id === response.id) {
                        nState.push({ ...value, status: '已发货' });
                    } else {
                        nState.push(value);
                    }
                });
                message.success(response.msg);
                return {
                    ...state,
                    data: nState
                };
            }
            message.error(response.msg);
            return state;
        },
        addOrUpdateItem(state, { payload: itemData }) {
            const nState = [];
            state.data.forEach((value) => {
                if (value.order_head_id === itemData.order_head_id) {
                    const nLine = [];
                    let addNext = false;
                    for (let i = 0; i < value.order_line.length; i++) {
                        const obj = value.order_line[i];
                        if (obj.order_line_id === itemData.oper_par_id) {
                            obj.oper_type = '已更换';
                            addNext = true;
                            obj.hasChild = true;
                            if (!obj.childsNum) {
                                obj.childsNum = 0;
                            }
                            obj.childsNum = obj.childsNum + 1;
                        }
                        nLine.push(obj);
                        if (addNext) {
                            itemData.order_line_id = new Date().getTime();
                            nLine.push(itemData);
                            addNext = false;
                        }
                    }
                    nState.push({ ...value, order_line: nLine });
                } else {
                    nState.push(value);
                }
            });
            return {
                ...state,
                data: nState
            };
        },
        newOrderLineRemove(state, { payload: { order_head_id, order_line_id } }) {
            const nState = [];
            state.data.forEach((value) => {
                if (value.order_head_id === order_head_id) {
                    const nLine = [];
                    for (let i = 0; i < value.order_line.length; i++) {
                        const obj = value.order_line[i];
                        if (obj.order_line_id === order_line_id) {
                            // 从父中取childsSum
                            const objPar = nLine.shift();
                            if (objPar.childsNum == undefined) {
                                objPar.hasChild = false;
                                objPar.oper_type = '正常';
                                objPar.hasRemoved = true;
                            } else {
                                objPar.childsNum = objPar.childsNum - 1;
                            }
                            if (objPar.childsNum === 0) {
                                objPar.hasChild = false;
                                objPar.oper_type = '正常';
                            }
                            nLine.unshift(objPar);
                            continue;
                        }
                        nLine.push(obj);
                    }
                    nState.push({ ...value, order_line: nLine });
                } else {
                    nState.push(value);
                }
            });
            return {
                ...state,
                data: nState
            };
        },
        changePrintTicket(state, { payload: response }) {
            if (response.status === 0) {
                ipcRenderer && ipcRenderer.send('bill-reprint', {
                    order: response.data.order
                });
            } else {
                message.error(response.msg);
            }
            return state;
        },
        changeSaveChgUpdateState(state, { payload: response }) {
            if (response.status === 0) {
                const nState = [];
                state.data.forEach((value) => {
                    if (value.order_head_id === response.order_head_id) {
                        nState.push({ ...value, order_line: response.data });
                    } else {
                        nState.push(value);
                    }
                });
                message.success(response.msg);
                return {
                    ...state,
                    data: nState
                };
            }
            response.msg && message.error(response.msg);
            return state;
        },
        errorRequest(state) {
            return {
                loading: false,
                page: state.page
            };
        },
        changeLoading(state) {
            return {
                loading: true,
                page: state.page
            }
        }
    },
    effects: {
        *gitEntOrder({ payload }, { call, put }) {
            yield put({ type: 'changeLoading' });
            const response = yield call(gitEntOrder, { ent_id: getDevice().ent_id, page_size: payload.pageSize, current: payload.page, search: payload.search });
            if (response.status === 0) {
                yield put({
                    type: 'changeOrderHead',
                    payload: {
                        data: response.data,
                        page: response.page,
                        loading: false
                    }
                });
            } else {
                yield put({
                    type: 'errorRequest'
                });
            }
        },
        *fetchOrderLine({ payload }, { call, put }) {
            const response = yield call(gitOrderDetail, { id: payload });
            yield put({
                type: 'changeOrderLine',
                payload: {
                    status: response.status,
                    data: response.data,
                    id: payload
                }
            });
        },
        *cancelOrder({ payload }, { call, put }) {
            const response = yield call(orderCancel, { id: payload, username: getUsername() });
            yield put({
                type: 'changeOrderCancel',
                payload: {
                    status: response.status,
                    id: payload,
                    msg: response.msg
                }
            });
        },
        *postOrder({ payload }, { call, put }) {
            const response = yield call(orderPost, { id: payload, username: getUsername() });
            yield put({
                type: 'changeOrderPost',
                payload: {
                    status: response.status,
                    id: payload,
                    msg: response.msg
                }
            });
        },
        *printTicket({ payload }, { call, put }) {
            const response = yield call(mallOrderInfo, { order_id: payload.order_id, order_no: payload.order_no });
            yield put({
                type: 'changePrintTicket',
                payload: response
            });
        },
        *saveChgUpdateItems({ payload }, { call, put }) {
            const response = yield call(chgUpdateItemsSave, { params: payload.data, username: getUsername(), order_head_id: payload.order_head_id });
            yield put({
                type: 'changeSaveChgUpdateState',
                payload: response
            });
        },
        *singleReturn({ payload }, { call, put }) {
            const response = yield call(singleItemReturns, { username: getUsername(), order_head_id: payload.order_head_id, order_line_id: payload.order_line_id });
            yield put({
                type: 'changeSaveChgUpdateState',
                payload: response
            });
        },

    }
});

const App = connect(({ order }) => ({ order }))(Order);

app.router(() => <App />);

app.start('#root');