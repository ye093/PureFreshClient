import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';

const ipcRenderer = require('electron').ipcRenderer;
import { getPrinter, getPaperWidth } from '../../util/AppData';


class Ticket extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            //打印大小
            paperWidth: '66',
            printer: '',
            t_createtime: '2018-07-18 20:49:50', // 小票创建时间
            ticket: {
                platform_name: '品珍商城', //商城名称
                ent_name: '大良店', // 店铺名称
                pay_method: '在线支付(已支付)',
                order_no: '136524554224552',
                pay_time: '2018-07-18 20:24',
                expected_delivery_time: '立刻送货',
                body: [
                    {
                        item_code: '0233',
                        item_name: '天堂人生果',
                        quantity: 1,
                        payment: 22.5
                    }
                ],
                post_fee: 6, //配送费
                discount_fee: 2.3, // 优惠金额
                order_amount: 30.8, // 订单金额
                address: '北京33号9街',
                mobile: '13630159257',
                receiver_name: '林先生'
            }
        };
    }


    componentDidMount() {
        // 在这里接收订单信息，和打印机信息
        ipcRenderer && ipcRenderer.on('bill-update', (event, args) => {

            //打印机大小
            let paperWidth = args.paperWidth || this.state.paperWidth;
            let printer = args.printer || this.state.printer;
            let d = new Date();
            let t_createtime = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
            let orderInfo = args.order;
            if (!!orderInfo) {
                // 这里要获取订单信息
                this.setState({
                    paperWidth: getPaperWidth(),
                    printer: getPrinter(),
                    t_createtime,
                    ticket: orderInfo
                });

            } else {
                // 打印测试
                this.setState({
                    paperWidth,
                    printer,
                    t_createtime
                });
            }
        });
    }

    componentDidUpdate() {
        // 更新完毕，发送打印命令
        // 把打印机名称，打印纸大小
        if (!!this.state.printer) {
            ipcRenderer && ipcRenderer.send('print-bill', this.state.printer);
        }
    }

    render() {
        const { paperWidth, t_createtime, ticket } = this.state;
        const { platform_name, ent_name, pay_method, order_no, pay_time, expected_delivery_time, body, post_fee, discount_fee, order_amount, address, mobile, receiver_name } = ticket;
        const layout =
            (<div className='ticket-constainer' style={{ width: paperWidth + 'mm' }}>
                <div className='t_ct full-width'>{t_createtime}</div>
                <div className='pfn full-width' >{platform_name}</div>
                <div className='ent_name full-width'>{ent_name}</div>
                <div className='pay_method full-width'>{pay_method}</div>

                <div className='divider-top full-width min-size padding-top'>订单号: {order_no}</div>
                <div className='full-width min-size'>下单时间: {pay_time}</div>
                <div className='full-width min-size padding-bottom'>期望送达时间: {expected_delivery_time ? expected_delivery_time : ''}</div>
                <div className='order-body full-width'>
                    <div className='items-table item-head'>
                        <div>数量</div>
                        <div>金额</div>
                    </div>
                    {body.map((obj) => (
                        <div key={obj.item_code} className='item-line' >
                            <div>{obj.item_name}</div>
                            <div className='items-table'>
                                <div>{obj.quantity}</div>
                                <div>{obj.payment}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='full-width min-size padding-top'>
                    <div>{`配送费：${post_fee}`}</div>
                </div>
                <div className='full-width sum'>
                    <div>{`总计：￥${order_amount}`}</div>
                </div>
                <div className='full-width padding-top addr'>
                    <div>地址：{address}</div>
                    <div>电话：{mobile}</div>
                    <div>姓名：{receiver_name}</div>
                </div>
            </div>);
        return layout;
    }

}

ReactDOM.render(<Ticket />, document.getElementById('root'));