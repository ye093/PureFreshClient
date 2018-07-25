import React from 'react';

import { Form, Icon, Input, Button, Checkbox } from 'antd';
const FormItem = Form.Item;
import './LoginForm.less';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = props.handleSubmit;
    this.state = {
      autoLogin: false,
      remember: false
    };
    this.autoLoginChecked = this.autoLoginChecked.bind(this);
    this.rememberChecked = this.rememberChecked.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    //在开始时禁用提交按钮
    this.props.form.validateFields();
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.autoLogin = this.state.autoLogin;
        values.remember = this.state.remember;
        this.handleSubmit(values);
      }
    });
  }

  hasErrors(errors) {
    return errors.username || errors.password;
  }

  autoLoginChecked(e) {
    this.setState((preState) => {
      if (e.target.checked !== preState.autoLogin) {
        if (e.target.checked) {
          return {
            autoLogin: true,
            remember: true
          };
        }
        return {autoLogin: e.target.checked};
      }
    });
  }

  rememberChecked(e) {
    this.setState((preState) => {
      if (e.target.checked !== preState.remember) {
        return {remember: e.target.checked};
      }
    });
  }


  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
    // Only show error after a field is touched.
    const usernameError = isFieldTouched('username') && getFieldError('username');
    const passwordError = isFieldTouched('password') && getFieldError('password');

    return (
      <Form onSubmit={this.onSubmit} className="login-form">
        <FormItem
          validateStatus={usernameError ? 'error' : ''}
          help={usernameError || ''}
        >
          {getFieldDecorator('username', {
            rules: [{ required: true, message: '请输入用户名！' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="账号" />
          )}
        </FormItem>

        <FormItem
          validateStatus={passwordError ? 'error' : ''}
          help={passwordError || ''}
        >
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码！' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
          )}
        </FormItem>
        <div className='login-operator' style={{display: "none"}}>
          <Checkbox className='auto-login' checked={this.state.autoLogin} onChange={this.autoLoginChecked} >自动登录</Checkbox>
          <Checkbox className='remember' checked={this.state.remember} onChange={this.rememberChecked} >记住密码</Checkbox>
          <span className='git-pwd'>找回密码</span>
        </div>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            disabled={this.hasErrors(getFieldsError())}
          >
            登录
          </Button>
        </FormItem>
      </Form>
    );
  }
}
export default Form.create()(LoginForm);

