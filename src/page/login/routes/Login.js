import React, { Component } from 'react';
import { Icon, Row, Col, message } from 'antd';
import LoginForm from '../../../components/Login/LoginForm';
import Logo from '../../../../static/money-9.png';
import '../index.less';

class Login extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    handleSubmit(values) {
        this.props.dispatch({ type: 'login/login', payload: values });
    }

    renderMessage(content) {
        message.error(content);
    };

    renderMessageOK(content) {
        message.success(content);
    };

    render() {
        const { login } = this.props;
        {
            login.flag !== undefined && (login.flag === false ?
                this.renderMessage(login.msg) : this.renderMessageOK(login.msg))
        }
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
                                this.props.dispatch({ type: 'login/minimize' });
                            }}>
                                <Icon type="minus" className="minus" />
                            </div>
                            <div title='关闭' onClick={() => {
                                this.props.dispatch({ type: 'login/close' });
                            }}>
                                <Icon type="close" className="close" />
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className='footer'>
                    <Row>
                        <Col span={16} offset={4}>
                            <LoginForm handleSubmit={(v) => this.handleSubmit(v)} />
                        </Col>
                    </Row>
                </div>
            </div>

        );
    }
}

export default Login;