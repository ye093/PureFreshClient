import { DatePicker, LocaleProvider, Radio, Select } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom';
const { RangePicker } = DatePicker;
import zhCN from 'antd/lib/locale-provider/zh_CN';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;
import './index.less';

class Ad extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            linkType: 'chooseItem',
            catDatas: [
                {
                    cat_id: 1,
                    cat_name: '你好',
                    cat_code: '0125',
                    link_url: 'list?catpid=%d&catpname=%s&catid=%d'
                },
                {
                    cat_id: 2,
                    cat_name: '你好',
                    cat_code: '01253',
                    link_url: 'list?catpid=%d&catpname=%s&catid=%d'
                },
                {
                    cat_id: 3,
                    cat_name: '你好',
                    cat_code: '012511',
                    link_url: 'list?catpid=%d&catpname=%s&catid=%d'
                }
            ],
            catData: {
                cat_id: 3,
                cat_name: '你好',
                cat_code: '012511',
                link_url: 'list?catpid=%d&catpname=%s&catid=%d'
            },
            itemData: {
                mall_id: 232,
                spu_name: '泥号啕',
                spu_code: '01025'
            },
            begin_date: '',
            end_date: '',
            linkPickerValue: null
        };
    }



    render() {
        return (
            <LocaleProvider locale={zhCN}>
                <div className='module-container'>
                    <div>
                        <RadioGroup onChange={(e) => {
                            
                            console.log('1111……>' + e.target.value);
                            this.setState({
                                linkType: e.target.value
                            });
                            if (e.target.value == 'chooseCat') {
                                // 请求品类数据

                            }
                        }} defaultValue={this.state.linkType}>
                            <RadioButton value="chooseItem">指向商品详情</RadioButton>
                            <RadioButton value="chooseCat">指向品类列表</RadioButton>
                        </RadioGroup>
                    </div>

                    <div>
                        <span>{this.state.linkType == 'chooseItem' ? '商品编码：' : '品类编码：'}</span>
                        <Select
                            mode="tags"
                            style={{ width: 300 }}
                            placeholder='请选择'
                            onChange={(e) => {
                                console.log('选择……>' + e.target.value);
                                if (this.state.linkType == 'chooseItem') {
                                    this.setState({
                                        itemData: {
                                            mall_id: 232,
                                            spu_name: '泥号啕',
                                            spu_code: '01025'
                                        }
                                    });
                                }
                            }}>
                            {this.state.catDatas.map(v => {
                                <Option key={v.cat_code} value={v.link_url}>{v.cat_name}</Option>
                            })}
                        </Select>
                    </div>

                    <div>
                        <span>有效期：</span>
                        <RangePicker value={this.state.linkPickerValue} format="YYYY-MM-DD" onChange={(dates, dateStrings) => {
                            this.setState({
                                linkPickerValue: dates,
                                begin_date: dateStrings[0],
                                end_date: dateStrings[1]
                            });
                            
                            console.log(`begin:${dateStrings[0]}, end: ${dateStrings[1]}`);
                        }} />
                    </div>
                </div>
            </LocaleProvider>
        );
    }

}


ReactDOM.render(<Ad />, document.getElementById('root'));