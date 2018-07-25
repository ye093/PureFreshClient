import React, { Component } from 'react';
import { Icon, Row, Col, message, Modal } from 'antd';
import Logo from '../../../../static/money-9.png';
import '../index.less';
import OrderTable from '../../../components/Order/OrderTable';
import AddItem from '../../../components/Item/AddItem';
import OrderSearch from '../../../components/OrderSearch/OrderSearch';

class Order extends Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            dialogVisible: false,
            order_head_id: undefined,
            order_line_id: undefined
        }
    }


    componentDidMount() {
        this.props.dispatch({ type: 'order/gitEntOrder', payload: { page: 1, pageSize: 10 } });
    }

    renderMessage(content) {
        message.error(content);
    };

    renderMessageOK(content) {
        message.success(content);
    };

    render() {
        const { loading, data, page } = this.props.order;
        const dispatch = this.props.dispatch;

        const { total, pageSize, current } = page;
        return (
            <div className='content' >
                <div className='header'>
                    <Row className='topbar'>
                        <Col span={12} className='header-left'>
                            <img src={Logo} />
                            <span>品珍鲜活</span>
                        </Col>
                        <Col span={6} offset={6} className='header-right'>
                            <div title='最小化' onClick={() => {
                                dispatch({ type: 'order/minimize' });
                            }}>
                                <Icon type="minus" className="minus" />
                            </div>
                            <div title='关闭' onClick={() => {
                                dispatch({ type: 'order/close' });
                            }}>
                                <Icon type="close" className="close" />
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className='footer'>
                    <OrderSearch onSearchSubmit={(searchVal) => {
                        dispatch({ type: 'order/gitEntOrder', payload: { page: 1, pageSize: 10, search: searchVal } });
                    }} />
                    <OrderTable data={data} loading={loading}
                        pagination={{
                            total: total || 0,
                            showTotal: (total) => `共有${total || 0}条`,
                            pageSize: pageSize || 10,
                            current: current || 1,
                            onChange(page, pageSize) {
                                dispatch({ type: 'order/gitEntOrder', payload: { page, pageSize } });
                            }
                        }}
                        fetchOrderLine={(id) => {
                            dispatch({ type: 'order/fetchOrderLine', payload: id });
                        }}
                        cancelOrder={(id) => {
                            // 整单取消
                            dispatch({ type: 'order/cancelOrder', payload: id });
                        }}
                        postOrder={(id) => {
                            // 整单发货
                            dispatch({ type: 'order/postOrder', payload: id });
                        }}
                        printTicket={(order_id, order_no) => {
                            // 重打小票
                            dispatch({ type: 'order/printTicket', payload: { order_id, order_no } });
                        }}
                        // exchangeItem(record.order_head_id, record.order_line_id)
                        exchangeItem={(order_head_id, order_line_id) => {
                            this.setState({ dialogVisible: true, order_head_id, order_line_id });
                        }}
                        // 单条移除
                        removeOrderLine={(order_head_id, order_line_id) => {
                            dispatch({ type: 'order/newOrderLineRemove', payload: { order_head_id, order_line_id } });
                        }}
                        // 修改保存
                        saveChgUpdateItems={(data, order_head_id) => {
                            dispatch({ type: 'order/saveChgUpdateItems', payload: { data, order_head_id } });
                        }}
                        // 部分退货
                        singleReturn={(order_head_id, order_line_id) => {
                            dispatch({ type: 'order/singleReturn', payload: { order_head_id, order_line_id } });
                        }} />
                </div>
                <Modal
                    title="更换商品"
                    visible={this.state.dialogVisible}
                    destroyOnClose={true}
                    maskClosable={false}
                    footer={null}
                    onCancel={() => {
                        this.setState({ dialogVisible: false });
                    }}>
                    <AddItem onAddItemCallback={(item) => {
                        const callbackData = {
                            ...item,
                            order_head_id: this.state.order_head_id,
                            oper_par_id: this.state.order_line_id,
                            oper_reason: item.reason,
                            quantity: item.qty,
                            sku_id: item.item_id,
                            discount_fee: 0,
                            is_gift: "否",
                            oper_type: "新增",
                            is_origin_item: 0,
                            sku_name: item.item_name,
                            sku_code: item.item_code
                        };
                        // 通知dispatch更改数据
                        dispatch({ type: 'order/addOrUpdateItem', payload: callbackData });
                        this.setState({
                            dialogVisible: false,
                            order_head_id: undefined,
                            order_line_id: undefined
                        });
                    }} />
                </Modal>
            </div>

        );
    }
}

export default Order;