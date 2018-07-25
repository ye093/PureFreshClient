import { Table, Menu, Dropdown, Icon, Popconfirm } from 'antd';
import React, { Component } from 'react';
import './OrderTable.less';

function NestedTable(props) {
    const expandedRowRender = (precord) => {
        const columns = [
            { title: '编码', dataIndex: 'sku_code', key: 'sku_code' },
            { title: '名称', dataIndex: 'sku_name', key: 'sku_name' },
            { title: '单价', dataIndex: 'price', key: 'price' },
            { title: '数量', dataIndex: 'quantity', key: 'quantity' },
            { title: '优惠', dataIndex: 'discount_fee', key: 'discount_fee' },
            { title: '实付', dataIndex: 'payment', key: 'payment' },
            { title: '赠品', dataIndex: 'is_gift', key: 'is_gift' },
            { title: '处理结果', dataIndex: 'oper_type', key: 'oper_type' },
            {
                title: '操作',
                dataIndex: 'oper',
                key: 'oper',
                render: (text, record) => {
                    return (record.is_origin_item === 0) ? (<span className="table-operation">
                        {/* 本地移除删除 */}
                        <Popconfirm placement="topLeft" title={`移除？`} onConfirm={() => {
                            // 移除事件
                            props.removeOrderLine(record.order_head_id, record.order_line_id);
                        }} okText="移除" cancelText="取消">
                            <a href="javascript:void(0)" >移除</a>
                        </Popconfirm>
                    </span>) :
                        (<span className="table-operation">
                            <a href="javascript:void(0)" onClick={() => {
                                // 更换商品事件
                                props.exchangeItem(record.order_head_id, record.order_line_id);
                            }} style={record.oper_type == '已退货' ? { pointerEvents: 'none', filter: 'alpha(opacity=50)', opacity: 0.5 } : {}}>更换+</a>
                            <Popconfirm placement="topLeft" title={`请核对退款金额！此操作会返还${record.payment}元给顾客！确认商品：${record.sku_name}要退货吗？`} onConfirm={() => {
                                //部分退货
                                props.singleReturn(record.order_head_id, record.order_line_id);
                            }} okText="确认退货" cancelText="取消">
                                <a href="javascript:void(0)" style={record.oper_type == '已退货' ? { pointerEvents: 'none', filter: 'alpha(opacity=50)', opacity: 0.5 } : {}}>退货</a>
                            </Popconfirm>
                            <Popconfirm placement="topLeft" title={`确认保存？`} onConfirm={() => {
                                //保存
                                const data = precord.order_line;
                                const uData = [];
                                data && data.forEach(v => {
                                    if (v.order_head_id === record.order_head_id) {
                                        if (v.order_line_id === record.order_line_id) {
                                            uData.push(v);
                                        }
                                        if (v.oper_par_id === record.order_line_id) {
                                            uData.push(v);
                                        }
                                    }
                                });
                                props.saveChgUpdateItems(uData, record.order_head_id);
                            }} okText="保存" cancelText="取消">
                                <a href="javascript:void(0)" style={(!record.hasRemoved && (record.oper_type == '已退货' || !record.hasChild)) ? { pointerEvents: 'none', filter: 'alpha(opacity=50)', opacity: 0.5 } : {}}>保存</a>
                            </Popconfirm>
                        </span>);
                }
            },
        ];

        const data = precord.order_line;
        return (
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                rowKey={(record) => record.order_line_id}
            />
        );
    };

    const columns = [
        { title: '单号', dataIndex: 'order_no', key: 'order_no' },
        { title: '时间', dataIndex: 'pay_time', key: 'pay_time' },
        { title: '金额', dataIndex: 'pay_amount', key: 'pay_amount' },
        { title: '订单状态', dataIndex: 'status', key: 'status' },
        { title: '收货人', dataIndex: 'receiver_name', key: 'receiver_name' },
        { title: '收货电话', dataIndex: 'mobile', key: 'mobile' },
        { title: '收货地址', dataIndex: 'address', key: 'address' },
        { title: '配送员', dataIndex: 'carrier_driver_name', key: 'carrier_driver_name' },
        { title: '配送员电话', dataIndex: 'carrier_driver_phone', key: 'carrier_driver_phone' },
        { title: '配送状态', dataIndex: 'order_status', key: 'order_status' },
        {
            title: '操作', key: 'operation', render: (text, record) => (
                <span className="table-operation">
                    <Popconfirm placement="topLeft" title={`整单退货！确认要取消订单(${record.order_no})吗？`} onConfirm={(event) => {
                        // 取消订单
                        props.cancelOrder(record.order_head_id);

                    }} okText="是的" cancelText="不">
                        <a href='javascript:void(0)' style={record.status != '待发货' ? { pointerEvents: 'none', filter: 'alpha(opacity=50)', opacity: 0.5 } : {}}>取消</a>
                    </Popconfirm>

                    <Popconfirm placement="topLeft" title={`确认订单(${record.order_no})已发货？`} onConfirm={() => {
                        //订单发货
                        props.postOrder(record.order_head_id);
                    }} okText="是的" cancelText="不">
                        <a href='javascript:void(0)' style={record.status != '待发货' ? { pointerEvents: 'none', filter: 'alpha(opacity=50)', opacity: 0.5 } : {}}>发货</a>
                    </Popconfirm>

                    <Popconfirm placement="topLeft" title={`确认打印(${record.order_no})小票？`} onConfirm={() => {
                        //打印小票
                        props.printTicket(record.order_head_id, record.order_no);
                    }} okText="打印" cancelText="取消">
                        <a href="javascript:void(0)">打印</a>
                    </Popconfirm>

                    {/* <Dropdown overlay={(
                        
                        <Menu>
                            <Menu.Item key="0">
                                <a href="javascript:void(0)" onClick={() => {
                                    props.printTicket(record.order_head_id, record.order_no);
                                }}>打印小票</a>
                            </Menu.Item>
                            <Menu.Item key="1">
                                <a href="javascript:void(0)">添加赠品</a>
                            </Menu.Item>
                        </Menu>
                    )} trigger={['click']}>
                        <a className="ant-dropdown-link" href="javascript:void(0)">
                            更多 <Icon type="down" />
                        </a>
                    </Dropdown> */}
                </span >
            )
        },
    ];
    return (
        <Table
            className="components-table-demo-nested"
            columns={columns}
            expandedRowRender={expandedRowRender}
            dataSource={props.data}
            rowKey={(record) => record.order_head_id}
            loading={!!props.loading}
            onChange={(pagination) => {
                props.pagination.onChange && props.pagination.onChange(pagination.current, pagination.pageSize);
            }}
            onExpand={(expanded, record) => {
                if (expanded) {
                    if (!record.order_line || record.order_line.length === 0) {
                        props.fetchOrderLine(record.order_head_id);
                    }
                }
            }}
            pagination={{
                total: props.pagination.total,
                defaultCurrent: 1,
                current: props.pagination.current,
                showTotal: props.pagination.showTotal || null,
                pageSize: props.pagination.pageSize
            }}
        />
    );
}


export default NestedTable;