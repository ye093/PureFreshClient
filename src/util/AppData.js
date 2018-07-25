import { set, get, remove, clear } from './Storage';

// 保存token
export function setToken(token) {
    set('user_token', token);
}

// 获取token
export function getToken() {
    return get('user_token');
}

// 清除token
export function removeToken() {
    remove('user_token');
}

// 设置自动登录
export function setAutoLogin(isAuto) {
    set('autologin', isAuto);
}

//获取自动登录
export function getAutoLogin() {
    return get('autologin');
}

// 设置记住密码
export function setRemember(isRemember) {
    set('remember', isRemember);
}

//获取记住密码
export function getRemember() {
    return get('remember');
}

// 设置密码
export function setPassword(password) {
    set('password', password);
}

//获取密码
export function getPassword() {
    return get('password');
}

export function removeUsernamePassword() {
    remove('username');
    remove('password');
}

// 设置账号
export function setUsername(username) {
    set('username', username);
}

//获取账号
export function getUsername() {
    return get('username');
}

// 是否是主组织
export function setIsMaster(isMaster) {
    set('is_master', isMaster);
}

//获取是否是主组织
export function getIsMaster() {
    return get('is_master');
}

// 设备连接信息
export function setDevice(device) {
    set('device', JSON.stringify(device));
}

//设备连接信息
export function getDevice() {
    return JSON.parse(get('device'));
}

// 打印机
export function setPrinter(name) {
    set('printer', name);
}

//打印机
export function getPrinter() {
    return get('printer');
}

// 打印机纸张大小
export function setPaperWidth(width) {
    set('printer-width', width);
}

//打印机纸张大小
export function getPaperWidth() {
    return get('printer-width');
}

// 清理所有数据
export function clearAll() {
    clear();
}
