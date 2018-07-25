import React from 'react';
import ReactDOM from 'react-dom';
import JsBarcode from 'jsbarcode';
import './index.less';

// 用户信息
const ipcRenderer = require('electron').ipcRenderer;


class Bill extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            //打印大小
            paperWidth: '66',
            printer: '',
            title: '品珍鲜活',
            ent: '大良店',
            orderNo: '03011023060023501',
            datetime: '2018.06.24 15:21',
            member: '13630159257',
            score: 250,
            items: [
                {
                    name: '[00382]海天黄豆酱油',
                    qty: 12,
                    price: 22.3,
                    real_price: 20.3,
                    payment: 243.6
                },
                {
                    name: '[00382]打印测试商品',
                    qty: 132,
                    price: 2332.3,
                    real_price: 20.3,
                    payment: 243.6
                }
            ],
            payinfo: {
                orderAmount: 243.6,
                discountAmount: 0.0,
                receiveAmount: 250,
                returnAmount: 6.4,
                method: [
                    {
                        name: '现金',
                        amount: 22
                    },
                    {
                        name: '支付宝',
                        amount: 50
                    }
                ]
            },
            helpinfo: {
                shoptel: '0757-22321550',
                shopaddress: '广东省佛山市顺德区大33良镇品珍鲜活大良',
                hotline: '4009309303'
            }
        };
        this.setBarcode = this.setBarcode.bind(this);
    }


    componentDidMount() {
        this.setBarcode(this.state.orderNo);
        // 在这里接收订单信息，和打印机信息
        ipcRenderer && ipcRenderer.on('bill-update', (event, args) => {
            //打印机大小
            let paperWidth = args.paperWidth || this.state.paperWidth;
            let printer = args.printer || this.state.printer;
            let orderInfo = args.order;
            if (!!orderInfo) {
                // 这里要获取订单信息


            } else {
                // 打印测试
                this.setState({
                    paperWidth,
                    printer
                });
            }
        });
    }

    componentWillUnmount() {
        this.barcodeEl = null;
    }

    setBarcode(code) {
        if (this.barcodeEl) {
            JsBarcode(this.barcodeEl, code, {
                height: 30,
                margin: 0,
                width: 1,
                displayValue: false
            });
        }
    }

    componentDidUpdate() {
        // 更新完毕，发送打印命令
        // 把打印机名称，打印纸大小
        if (!!this.state.printer) {
            ipcRenderer && ipcRenderer.send('print-bill', this.state.printer);
        }
    }



    render() {
        const layout =
            (<div className='html-container' style={{ width: `${this.state.paperWidth}mm` }}>
                {/* 标题 */}
                <div className='title'>{this.state.title}</div>
                {/* 单号、时间、会员信息 */}
                <ul>
                    <li><div>{`门店：${this.state.ent}`}</div></li>
                    <li><div>{`单号：${this.state.orderNo}`}</div></li>
                    <li><div>{`时间：${this.state.datetime}`}</div></li>
                    {this.state.member &&
                        <li><div>{`会员：${this.state.member}`}</div></li>
                    }
                    {this.state.score &&
                        <li><div>{`积分：${this.state.score}`}</div></li>
                    }
                </ul>

                <div className='divider' />

                {/* 明细 */}
                <div className='items-table'><div className='bold'>数量</div><div className='bold'>原价</div>
                    <div className='bold'>实价</div><div className='bold'>小计</div></div>
                <ul>
                    {this.state.items && this.state.items.length > 0 &&
                        this.state.items.map((obj, index) =>
                            <li key={index}>
                                <div>{obj.name}</div>
                                <div className='items-table'><div>{obj.qty}</div><div>{obj.price}</div><div>{obj.real_price}</div><div>{obj.payment}</div></div>
                            </li>
                        )
                    }
                </ul>

                <div className='divider' />

                {/* 付款信息 */}
                <div>
                    <div className='space-between'>
                        <div>订单金额：<span className='bold'>{this.state.payinfo.orderAmount}</span></div>
                        <div>优惠金额：<span className='bold'>{this.state.payinfo.discountAmount}</span></div>
                    </div>
                    <div className='space-between'>
                        <div>收款：<span className='bold'>{this.state.payinfo.receiveAmount}</span></div>
                        <div>找零：<span className='bold'>{this.state.payinfo.returnAmount}</span></div>
                    </div>
                    <div className='bold empty-divider'>付款方式：</div>
                    <div className='space-around-wrap'>
                        {this.state.payinfo.method.map((obj, index) =>
                            <div key={index}>{`${obj.name}：`}<span className='bold'>{obj.amount}</span></div>
                        )}
                    </div>
                </div>

                <div className='divider' />

                {/* 店铺信息，服务电话 */}
                <div>
                    <div>欢迎下次光临 服务电话：{this.state.helpinfo.shoptel}</div>
                    <div>店铺地址：{this.state.helpinfo.shopaddress}</div>
                    <div>品珍鲜活全国服务热线：{this.state.helpinfo.hotline}</div>
                </div>

                <div className='divider' />

                {/* 条码 */}
                <div className='barcode'>
                    <svg ref={barcodeEl => this.barcodeEl = barcodeEl} />
                </div>
            </div>);
        return layout;
    }

}

ReactDOM.render(<Bill />, document.getElementById('root'));