import React from 'react';
import ReactDOM from 'react-dom';
import XLSX from 'xlsx';
import './index.less';
const dialog = require('electron').remote.dialog;



class MyXlsx extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            path: '请选择文件',
            content: ''
        };
        this.chooseFile = this.chooseFile.bind(this);
    }

    // 选择文件
    chooseFile(e) {
        console.log('11111->' + dialog);
        dialog.showOpenDialog({
            title: '选择文件',
            buttonLabel: '选择',
            filters: [
                { name: 'XLSX', extensions: ['xlsx'] }
            ],
            properties: ['openFile']
        }, (filePaths) => {
            if (filePaths.length > 0) {
                const path = filePaths[0];
                const workBook = XLSX.readFile(path);
                const data = JSON.stringify(XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]));
                
                this.setState({
                    path: path,
                    content: data
                });
            }
        });
        e.preventDefault();
    }


    render() {
        const layout =
            (<div>
                <button onClick={this.chooseFile} >{this.state.path}</button>
                <p>{this.state.content}</p>
            </div>);
        return layout;
    }
}

ReactDOM.render(<MyXlsx />, document.getElementById('root'));