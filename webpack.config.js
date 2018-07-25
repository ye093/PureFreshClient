const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

//页面入口
const pages = require('./pages');
const entry = {};
//构建之前要清理的目录
const cleandirs = [];
//生成页面的html文件
const htmlPlugins = [];
pages.forEach(v => {
    //页面入口
    const k = v.path.split("/")[3];
    entry[k] = ["babel-polyfill", v.path];
    //要清理的目录
    cleandirs.push('electron/dist/page/' + k);
    //生成对应的html模版
    htmlPlugins.push(new HtmlWebpackPlugin({
        title: v.title,
        filename: `${k}.html`,
        template: './static/index.ejs',
        chunks: [k] //引用的js模板
    }));
});

module.exports = {
    entry,
    output: {
        filename: 'page/[name]/' + 'index.js',
        path: __dirname + '/electron/dist'
    },
    target: "electron-renderer",
    devtool: 'inline-source-map',
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.less$/, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'less-loader', options: { javascriptEnabled: true } }] },
            { test: /\.ts$/, use: ['ts-loader'] },
            { test: /\.(png|svg|jpg|gif)$/, use: ['file-loader'] },
            { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] },
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    plugins: [
        // new UglifyJsPlugin({
        //     parallel: 4,
        //     uglifyOptions: {
        //         output: {
        //             comments: false,
        //             beautify: false,
        //         },
        //         compress: {
        //             warnings: false
        //         },
        //     },
        //     cache: true,
        // }),
        new CleanWebpackPlugin(cleandirs),
        ...htmlPlugins
    ],
    mode: "none"
};