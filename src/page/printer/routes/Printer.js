import React, { Component } from 'react';
import { Icon, Row, Col, InputNumber, Select, Button, message } from 'antd';
const Option = Select.Option;
import Logo from '../../../../static/money-9.png';
import '../index.less';


class Printer extends Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            inputWidth: undefined,
            checkValue: undefined
        }
    }


    componentDidMount() {
        this.props.dispatch({ type: 'printer/sysPrinters' });
    }


    render() {
        const { inputWidth, checkValue } = this.state;
        const { printer } = this.props;
        const { printers, defaultPrinter, printWidth } = printer;
        return (
            <div className='content' >
                <div className='header'>
                    <Row className='topbar'>
                        <Col span={12} className='header-left'>
                            <img src={Logo} />
                            <span>打印机设置</span>
                        </Col>
                        <Col span={6} offset={6} className='header-right'>
                            <div title='最小化' onClick={() => {
                                this.props.dispatch({ type: 'printer/minimize' });
                            }
                            }>
                                <Icon type="minus" className="minus" />
                            </div>
                            <div title='关闭' onClick={() => {
                                this.props.dispatch({ type: 'printer/close' });
                            }}>
                                <Icon type="close" className="close" />
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className='footer'>
                    <Row style={{ marginTop: 20 }} type="flex" justify="center" align="center" >
                        <Col span={6}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 14 }}>
                                <span>选择打印机</span>
                                <Icon type="printer" />
                            </div>
                        </Col>
                        <Col span={12} offset={1}>
                            <Select value={checkValue ? checkValue : (defaultPrinter || '')} style={{ width: 180 }} onChange={(v) => {
                                this.setState({
                                    checkValue: v
                                });
                            }}>
                                {printers.map((val) => (
                                    <Option value={val} key={val}>{val}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 15 }} type="flex" justify="center" align="center">
                        <Col span={6}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 14 }}>
                                <span>纸张大小</span>
                                <Icon type="file-text" />
                            </div>
                        </Col>
                        <Col span={12} offset={1}>
                            <InputNumber min={40} max={120} value={inputWidth ? inputWidth : (printWidth || 66)} style={{ width: 120 }} onChange={(value) => {
                                this.setState({
                                    inputWidth: value
                                });
                            }} />

                            <span style={{ marginLeft: 5 }}>毫米</span>

                        </Col>
                    </Row>

                    <Row style={{ marginTop: 30 }} type="flex" justify="center" align="center">
                        <Col span={12}>
                            <Button type="primary" style={{ width: '100%' }}
                                onClick={() => {
                                    const pri = checkValue ? checkValue : defaultPrinter;
                                    if (!pri) {
                                        message.error('请先选择打印机！');
                                        return;
                                    }
                                    this.props.dispatch({
                                        type: 'printer/printTest', payload: {
                                            printer: pri,
                                            paperWidth: inputWidth ? inputWidth : printWidth
                                        }
                                    });
                                }}
                            >打印测试</Button>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 15 }} type="flex" justify="center" align="center">
                        <Col span={12}>
                            <Button type="primary" style={{ width: '100%' }} onClick={() => {
                                // 保存打印信息
                                this.props.dispatch({
                                    type: 'printer/save', payload: {
                                        printer: checkValue ? checkValue : defaultPrinter,
                                        paperWidth: inputWidth ? inputWidth : (printWidth ? printWidth : '66')
                                    }
                                });

                            }} >保存</Button>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

}



export default Printer;