import React, { Component } from 'react';
import { Row, Col, Select, DatePicker, Input, Button } from 'antd';
const Option = Select.Option;
const InputGroup = Input.Group;
import locale from 'antd/lib/date-picker/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import './OrderSearch.less';

class OrderSearch extends Component {
    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            begin_date: null,
            end_date: null,
            status: 0,
            input_type: '订单号',
            input_value: ''
        }
    }


    render() {
        const { begin_date, end_date, status, input_type, input_value } = this.state;
        const { onSearchSubmit } = this.props;
        return (
            <div>
                <Row type='flex' justify='start' gutter={16} align='bottom' style={{ height: 45, marginBottom: 15 }} >
                    <Col>
                        <span>状态：</span>
                        {/* 2待发货，3待收货，5取消 */}
                        <Select labelInValue value={{ key: status }} style={{ width: 120 }} onChange={(value) => {
                            this.setState({
                                status: Number.parseInt(value.key)
                            });
                        }}>
                            <Option value={0}>全部</Option>
                            <Option value={2}>待发货</Option>
                            <Option value={3}>已发货</Option>
                            <Option value={4}>已完成</Option>
                            <Option value={5}>已取消</Option>
                        </Select>
                    </Col>
                    <Col>
                        <span>日期：</span>
                        <DatePicker value={begin_date && moment(begin_date, 'YYYY-MM-DD')} onChange={(date, dateString) => {
                            if (!date) {
                                this.setState({
                                    begin_date: '',
                                    end_date: ''
                                });
                                return;
                            }
                            const selectDate = date.format('YYYY-MM-DD');
                            this.setState({
                                begin_date: `${selectDate} 00:00:00`,
                                end_date: `${selectDate} 23:59:59`
                            });
                        }} locale={locale} />
                    </Col>
                    <Col>
                        <InputGroup compact style={{ display: 'inline-flex' }}>
                            <Select value={input_type} onChange={(value) => {
                                this.setState({
                                    input_type: value
                                });
                            }}>
                                <Option value="订单号">订单号</Option>
                                <Option value="手机号">手机号</Option>
                            </Select>
                            <Input value={input_value} onChange={(e) => {
                                this.setState({
                                    input_value: e.target.value
                                });
                            }} />
                        </InputGroup>
                    </Col>
                    <Col>
                        <Button type="primary" onClick={() => {
                            const putValues = {
                                status
                            };
                            if (begin_date) {
                                putValues.begin_date = begin_date;
                            }
                            if (end_date) {
                                putValues.end_date = end_date;
                            }
                            if (input_value) {
                                if (input_type === '订单号') {
                                    putValues.order_no = input_value;
                                } else if (input_type === '手机号') {
                                    putValues.mobile = input_value;
                                }
                            }
                            onSearchSubmit && onSearchSubmit(putValues);
                        }}>查询</Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => {
                            this.setState({
                                begin_date: null,
                                end_date: null,
                                status: 0,
                                input_value: ''
                            });
                        }} >清除</Button>
                    </Col>
                </Row>
            </div >
        );

    }
}

export default OrderSearch;