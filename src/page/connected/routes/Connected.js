import React, { Component } from 'react';
import { Icon, Row, Col, Button } from 'antd';
import Logo from '../../../../static/money-9.png';
import '../index.less';
const ipcRenderer = require('electron').ipcRenderer;


class Connected extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isConnected: false,
            connecting: true
        }
    }


    componentDidMount() {
        ipcRenderer && ipcRenderer.on('connected', (event, message) => {
            this.setState({
                isConnected: message.isConnected,
                connecting: message.connecting
            });
        });
        ipcRenderer && ipcRenderer.send('isConnected');
    }


    render() {
        const { isConnected, connecting } = this.state;
        return (
            <div className='content' >
                <div className='header'>
                    <Row className='topbar'>
                        <Col span={12} className='header-left'>
                            <img src={Logo} />
                            <span>品珍鲜活</span>
                        </Col>
                        <Col span={6} offset={6} className='header-right'>
                            <div title='最小化到托盘' onClick={() => {
                                this.props.dispatch({ type: 'connected/minToTray' });
                            }}>
                                <Icon type="close" className="close" />
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className='footer'>

                    <Row>
                        <Col span={4} offset={10}>
                            <Icon type={connecting ? 'loading' : (isConnected ? 'check' : 'close')} style={{ fontSize: 40, color: '#64b5f6', textAlign: 'center', marginTop: 20, marginBottom: 10, width: '100%' }} />
                        </Col>
                    </Row>

                    <Row>
                        <Col span={16} offset={4}>
                            <Button type="primary" loading={connecting} style={{ width: '100%', marginTop: '20px' }}
                                onClick={() => {
                                    if (isConnected) {
                                        this.props.dispatch({ type: 'connected/disConnect' });
                                    } else {
                                        this.props.dispatch({ type: 'connected/reConnect' });
                                    }
                                }}
                            >{isConnected ? '断开连接' : '重新连接'}</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={16} offset={4}>
                            <Button type="primary" onClick={() => {
                                this.props.dispatch({ type: 'connected/checkOrder' });
                            }} style={{ width: '100%', marginTop: '15px' }}>查看订单</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={16} offset={4}>
                            <Button onClick={() => {
                                this.props.dispatch({ type: 'connected/printerSetting' });
                            }} style={{ width: '100%', marginTop: '15px' }}>打印机设置</Button>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }

}



export default Connected;