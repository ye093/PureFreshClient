import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import JsBarcode from 'jsbarcode';


class SfExpress extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            orderNo: '003203023629'
        }

        this.setBarcode = this.setBarcode.bind(this);
    }
    
    componentDidMount() {
        this.setBarcode(this.state.orderNo);
    }

    componentWillUnmount() {
        this.barcodeEl = null;
    }


    setBarcode(code) {
        if (this.barcodeEl) {
            JsBarcode(this.barcodeEl, code, {
                format: 'CODE128C',
                height: 45.34,
                width: 2.58,
                margin: 0,
                displayValue: false
            });
        }
    }

    render() {
        // 210规格电子运单模版
        const layout = (
            <div class='html-container'>
                {/* logo个性化提示区 */}
                <div class='item1'>

                </div>
                {/* 条码区,业务类型，代收款项 */}
                <div class='item2'>
                    {/* 条码 */}
                    <div className='barcode'>
                        <svg ref={barcodeEl => this.barcodeEl = barcodeEl} />
                    </div>

                </div>

            </div>
        );

        return layout;
    }
}

ReactDOM.render(<SfExpress />, document.getElementById('root'));

