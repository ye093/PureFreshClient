import React, { Component } from 'react';
import fly from 'flyio';
import './AdModal.less';
import { Modal, Radio, Input, Select, Button, DatePicker } from 'antd';
const RangePicker = DatePicker.RangePicker;
const RadioGroup = Radio.Group;
const Option = Select.Option;
import moment from 'moment';

//用传过来的数据初始化，返回修改后的数据

class AdModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            link_url: undefined,
            spu_name: undefined,
            cat_name: undefined,
            begin_date: undefined,
            end_date: undefined,
            catData: null,
            choose_type: undefined,
            spu_code_input: '',
            okLoading: false
        }

        this.init = this.init.bind(this);
        this.okClick = this.okClick.bind(this);
        this.chooseType = this.chooseType.bind(this);
    }

    componentDidMount() {
        const self = this;
        this.state.catData || fly.get(`/serp/cat/getLastLevel`).then(res => {
            if (res.data.status === 0) {
                self.setState({
                    catData: res.data.data
                });
            }
        }).catch(e => {
            console.log('错误：' + e);
        });
    }

    // 初始化
    init() {
        console.log('点击了init');
        this.setState({
            link_url: undefined,
            spu_name: undefined,
            cat_name: undefined,
            begin_date: undefined,
            end_date: undefined,
            choose_type: undefined,
            spu_code_input: '',
            okLoading: false
        });
    }


    okClick(callBack, ad_id) {
        //关闭窗口
        const visible = false;
        const { link_url, begin_date, end_date, spu_name, cat_name } = this.state;
        if (link_url || begin_date || end_date) {
            //进入加载状态
            this.setState({
                okLoading: true
            });
            const self = this;
            let urlParams = '';
            link_url && (urlParams = urlParams + '&link_url=' + encodeURIComponent(link_url));
            begin_date && (urlParams = urlParams + '&begin_date=' + begin_date.format('YYYY-MM-DD'));
            end_date && (urlParams = urlParams + '&end_date=' + end_date.format('YYYY-MM-DD'));
            fly.get(`/serp/ad/updateAd?ad_id=${ad_id}${urlParams}`).then(res => {
                if (res.data.status === 0) {
                    //返回前面页面
                    let obj = { ad_id: ad_id };
                    if (link_url) obj.link_url = link_url;
                    if (spu_name) obj.spu_name = spu_name;
                    if (cat_name) obj.cat_name = cat_name;
                    if (begin_date) obj.begin_date = begin_date.format('YYYY-MM-DD');
                    if (end_date) obj.end_date = end_date.format('YYYY-MM-DD');
                    callBack(visible, obj);
                    self.init();
                } else {
                    callBack(visible);
                    self.init();
                }
            }).catch(e => {
                console.log(e);
                callBack(visible);
                self.init();
            });
        } else {
            callBack(visible);
            //还原
            this.init();
        }
    }

    chooseType(v) {
        this.setState({
            choose_type: v.target.value
        });
    }

    render() {
        const { link_url, spu_name, cat_name, begin_date, end_date, catData, choose_type, spu_code_input, okLoading } = this.state;
        const { isVisible, callBack, first_begin_date, first_end_date, first_link_url, first_link_name, first_choose_type, ad_id } = this.props;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
            marginTop: '15px'
        };
        return (
            <Modal
                title="设置广告属性"
                visible={isVisible}
                style={{ width: 600 }}
                onOk={() => this.okClick(callBack, ad_id)}
                onCancel={() => {
                    //重置
                    this.init();
                    //关闭窗口
                    const visible = false;
                    callBack(visible);
                }}
                okText="确认"
                cancelText="取消">

                <div>
                    {/* 名称 */}
                    <div>
                        <span style={{ fontWeight: 'bolder', fontSize: 14 }}>名称：{spu_name ? spu_name : (cat_name ? cat_name : first_link_name)}</span>
                    </div>

                    {/* 商品、品类 */}
                    <div>
                        <RadioGroup onChange={this.chooseType} value={choose_type || first_choose_type}>
                            <Radio style={radioStyle} value={1}>商品编码:
                                <span> <Input disabled={choose_type === 2 || (choose_type === undefined && first_choose_type === 2)} defaultValue="" style={{ width: 150 }} value={spu_code_input} onChange={(e) => {
                                    this.setState({
                                        spu_code_input: e.target.value
                                    });
                                }} /><Button type="primary" disabled={choose_type === 2 || (choose_type == undefined && first_choose_type === 2)}
                                    loading={okLoading}
                                    onClick={
                                        () => {
                                            if (spu_code_input && spu_code_input > 4) {
                                                const self = this;
                                                fly.get(`/serp/mitem/getAdLinkByCode?item_code=${spu_code_input}`).then(res => {
                                                    if (res.data.status === 0) {
                                                        self.setState({
                                                            spu_name: res.data.data.spu_name,
                                                            cat_name: undefined,
                                                            link_url: res.data.data.link_url
                                                        });
                                                    }
                                                }).catch(e => {
                                                    console.log(e);
                                                });
                                            }
                                        }
                                    }>生成</Button></span>
                            </Radio>
                            <Radio style={radioStyle} value={2}>品类名称:
                                <Select disabled={choose_type === 1 || (choose_type == undefined && first_choose_type === 1)} style={{ width: 218 }} onChange={(e) => {
                                    console.log(JSON.stringify(e));
                                    let [myCatName, myLinkUrl] = e.split('#');
                                    this.setState({
                                        spu_name: undefined,
                                        cat_name: myCatName,
                                        link_url: myLinkUrl
                                    });

                                }}>
                                    {catData != null ? catData.map(value => (
                                        <Option key={value.cat_id} value={value.cat_name + '#' + value.link_url}>{value.cat_name}</Option>
                                    )) : null}
                                </Select>
                            </Radio>
                        </RadioGroup>
                    </div>

                    {/* 连接地址 */}
                    <div style={radioStyle}>
                        <span style={{ fontWeight: 'bolder', fontSize: 14 }}>指向URL: {link_url || first_link_url}</span>
                    </div>

                    {/* 有效期 */}
                    <div className='row-flex'>
                        <div>有效期：</div>
                        <div>
                            <RangePicker defaultValue={[moment(first_begin_date || new Date(), 'YYYY-MM-DD'), moment(first_end_date || new Date(), 'YYYY-MM-DD')]}
                                format='YYYY-MM-DD'
                                value={[moment((begin_date || first_begin_date || new Date()), 'YYYY-MM-DD'), moment((end_date || first_end_date || new Date()), 'YYYY-MM-DD')]}
                                onChange={(dateStrings) => {
                                    console.log(dateStrings);
                                    //选择好日期
                                    this.setState(
                                        {
                                            begin_date: dateStrings[0],
                                            end_date: dateStrings[1]
                                        }
                                    );
                                }} />
                        </div>
                    </div>

                </div>
            </Modal>
        );
    }


}
export default AdModal;