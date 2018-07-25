import React, { Component } from 'react';
import './AddItem.less';
import { Row, Col, Input, InputNumber, message, Button } from 'antd';
import { searchItem } from '../../service/api';
import { getDevice } from '../../util/AppData';

class AddItem extends Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            item_code: '',
            item_name: '',
            price: undefined,
            qty: 1,
            uom_name: '',
            reason: ''
        }
    }

    render() {
        const { item_code, item_name, price, qty, reason, uom_name } = this.state;
        const { onAddItemCallback } = this.props;
        return (
            <div>
                {/* 商品编码 */}
                <Row gutter={2} justify={'center'} >
                    <Col span={6}>
                        <div className='tip-left'>商品编码：</div>
                    </Col>
                    <Col span={12}>
                        <div>
                            <Input.Search
                                placeholder="请输入商品编码"
                                enterButton="确认"
                                onSearch={value => {
                                    const self = this;
                                    searchItem({ item_code: value, ent_id: getDevice().ent_id })
                                        .then((resp) => {
                                            if (resp.status === 0) {
                                                const { item_code, item_id, price, item_name, uom_name } = resp.data;
                                                self.setState({
                                                    item_code, item_id, price, item_name, uom_name
                                                });
                                            } else {
                                                message.error(resp.msg);
                                            }
                                        }).catch((e) => {
                                            console.log(e);
                                        });
                                }} />
                        </div>
                    </Col>
                </Row>
                {/* 商品名称 */}
                <Row gutter={2} justify={'center'} style={{ marginTop: 10 }}>
                    <Col span={6}>
                        <div className='tip-left'>商品名称：</div>
                    </Col>
                    <Col span={12}>
                        <div className='tip-right bold'>
                            {item_name}
                        </div>
                    </Col>
                </Row>

                {/* 单价 */}
                <Row gutter={2} justify={'center'} style={{ marginTop: 10 }}>
                    <Col span={6}>
                        <div className='tip-left'>单价：</div>
                    </Col>
                    <Col span={12}>
                        <div className='tip-right bold'>
                            {price || ''}
                        </div>
                    </Col>
                </Row>

                {/* 数量 */}
                <Row gutter={2} justify={'center'} style={{ marginTop: 10 }}>
                    <Col span={6}>
                        <div className='tip-left'>数量：</div>
                    </Col>
                    <Col span={12}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <InputNumber min={0} placeholder="请输入数量" onChange={(value) => this.setState({ qty: value })} />
                            <span style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 3 }}>{uom_name}</span>
                        </div>
                    </Col>
                </Row>

                {/* 更换原因 */}
                <Row gutter={2} justify={'center'} style={{ marginTop: 10 }}>
                    <Col span={6}>
                        <div className='tip-left'>原因：</div>
                    </Col>
                    <Col span={12}>
                        <div className='tip-right'>
                            <Input.TextArea rows={4} onChange={(e) => {
                                this.setState({
                                    reason: e.target.value
                                });
                            }} />
                        </div>
                    </Col>
                </Row>

                {/* 保存 */}
                <Row gutter={2} justify={'center'} style={{ marginTop: 15 }}>

                    <Col span={24}>
                        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}} >
                            <Button type={'primary'} onClick={() => {
                                if (!item_code) {
                                    message.error('请先输入商品编码后点击查询');
                                } else if (!reason) {
                                    message.error('请输入换货理由');
                                } else if (qty <= 0) {
                                    message.error('请输入有效数量');
                                } else {
                                    onAddItemCallback(this.state);
                                }
                            }} >提交</Button>

                        </div>
                    </Col>
                </Row>
            </div>
        );
    }




}


export default AddItem;