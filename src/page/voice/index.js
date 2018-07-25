import React from 'react';
import ReactDOM from 'react-dom';

const ipcRenderer = require('electron').ipcRenderer;

class Voice extends React.Component {

    shouldComponentUpdate() {
        return true;
    }

    componentDidMount() {
        // 在这里接收订单信息，和打印机信息
        ipcRenderer && ipcRenderer.on('audio-ready', (event, args) => {
            if (this.audioRef && !!args) {
                if (!this.audioRef.src || this.audioRef.ended) {
                    this.audioRef.src = args;
                    this.audioRef.load();
                    this.audioRef.play();
                }
            }

        });
    }
    componentWillUnmount() {
        if (this.audioRef) {
            this.audioRef = null;
        }
    }


    render() {
        return (
            <audio ref={(audioRef) => {
                this.audioRef = audioRef;
            }}></audio>
        );
    }
}
ReactDOM.render(<Voice />, document.getElementById('root'));