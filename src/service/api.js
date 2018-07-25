const service = require('./service');

//服务器地址
const SER_URL = "http://localhost:8080";

// 用户登录接口并返回设备连接信息
export async function baseLogin(postData) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/v1/iot?username=${postData.username}&password=${postData.password}`
    });
}

// 更新用户配置信息
export async function printerSetting(postData) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/v1/iot/printerSetting?printer=${postData.printer}&paperWidth=${postData.paperWidth}&iot_id=${postData.iot_id}`
    });
}

// 获取订单信息(小票)
export async function mallOrderInfo({ order_id, order_no }) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/v1/iot/gitMallOrder?order_id=${order_id}&order_no=${order_no}`
    });
}

// 获取订单信息(查看订单)
export async function gitEntOrder({ ent_id, page_size, current, search }) {
    let appendPara = '';
    if (search) {
        for (let k in search) {
            appendPara = appendPara + '&' + k + '=' + search[k];
        }
    }
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/gitEntOrder?ent_id=${ent_id}&page_size=${page_size}&current=${current}${appendPara}`
    });
}

// 获取订单体
export async function gitOrderDetail({ id }) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/gitOrderDetail?id=${id}`
    });
}

// 取消订单（整单取消）
export async function orderCancel({ id, username }) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/orderCancel?id=${id}&username=${username}`
    });
}

// 订单发货
export async function orderPost({ id, username }) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/orderPost?id=${id}&username=${username}`
    });
}

// 查询商品
export async function searchItem({ item_code, ent_id }) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/searchItem?item_code=${item_code}&ent_id=${ent_id}`
    });
}
// 修改商品
export async function chgUpdateItemsSave({ params, username, order_head_id }) {
    const encodeParams = encodeURIComponent(JSON.stringify(params));
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/changeOrUpdateItem?params=${encodeParams}&username=${username}&order_head_id=${order_head_id}`
    });
}
// 部分退货
export async function singleItemReturns({ username, order_head_id, order_line_id }) {
    return service.request({
        method: 'GET',
        url: `${SER_URL}/serp/orderHead/singleItemReturns?order_line_id=${order_line_id}&username=${username}&order_head_id=${order_head_id}`
    });
}


