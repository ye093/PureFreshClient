import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const dialog = electron.remote.dialog;
const url = require('url');

import { DatePicker } from 'antd';

const XLSX = require('xlsx');


class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paths: []
        }
    }

    componentDidMount() {
        ipcRenderer.on('execelFile', (event, arg) => {
            const wb = XLSX.readFile(arg[0]);
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            console.log(data);
            this.setState({
                paths: arg
            });
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners();
    }

    render() {
        return (
            <div>
            <h2 className='test' onClick={() => {
                // ipcRenderer.send('showOpenDialog');

                dialog.showSaveDialog({
                    title: '保存excel文件',
                    buttonLabel: '保存',
                    defaultPath: 'two',
                    filters: [{
                        name: 'Excel',
                        extensions: ['xlsx']
                    }]
                }, (filename, bookmark) => {
                    if (!filename) {
                        return;
                    }
                    
                    const worksheet = XLSX.utils.json_to_sheet([{
                        name: 'yejinyun',
                        age: 23
                    },
                    {
                        name: 'lam',
                        age: 23
                    }], {
                        header: ['age', 'name'],
                        skipHeader: true
                    });
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, worksheet, '第一个脚本');
                    XLSX.writeFile(wb, filename);
                });
    
                // let subWin = new BrowserWindow({width: 300, height: 300});
                // subWin.loadURL(url.format({
                //     pathname: "../dist/user.html",
                //     protocol: "file:",
                //     slashes: true
                // }));
                // subWin.on('closed', () => {
                //     subWin = null;
                // });
    
    
            }} >选择文件</h2>
            <DatePicker />
            {this.state.paths.map(v => {
                return <img src={v} key={v} alt={v} style={{displace: 'block', width: '30px', height: '30px'}} ></img>;
            })}
            
            </div>
        );
    }
    
}

ReactDOM.render(<Test />, document.getElementById('root'));