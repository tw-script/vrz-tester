'use strict'

// 要素
const connectButton = document.querySelector('#connect')
const listDiv = document.querySelector('#list')

// 接続済みの機種リストのオブジェクト
const list = {}

// 値の書き込み
const writeValue = async(e) =>
{
    const item = list[e.target.value]
    const byte = new Uint8Array
    ([
        parseInt(item.byte0Text.value, 16),
        parseInt(item.byte1Text.value, 16),
        parseInt(item.byte2Text.value, 16),
    ])
    await item.characteristic.writeValue(byte)
}

// 切断
const disconnect = async(e) =>
{
    const item = list[e.currentTarget.name]
    item.div.remove()
    list[e.currentTarget.name] = null
}

// 接続
const connect = async() =>
{
    // Vorze機器で固定の値
    const SERVICE_UUID = '40ee1111-63ec-4b7f-8ce7-712efd55b90e'
    const CHARACTERISTIC_UUID = '40ee2222-63ec-4b7f-8ce7-712efd55b90e'

    // デバイスを列挙し、選択するダイアログ
    const device = await navigator.bluetooth.requestDevice
    ({
        filters: [{services: [SERVICE_UUID]}]
    })

    // 既にリストにあったら終わり
    if(list[device.name]) return
    
    // 機器のオブジェクト
    const item = {}

    // 接続
    item.server = await device.gatt.connect()
    item.service = await item.server.getPrimaryService(SERVICE_UUID)
    item.characteristic = await item.service.getCharacteristic(CHARACTERISTIC_UUID)

    // 入力欄とボタンを用意
    const div = document.createElement('div')
    const byte0 = document.createElement('input')
    byte0.type = 'text'
    byte0.maxLength = 2
    const byte1 = document.createElement('input')
    byte1.type = 'text'
    byte1.maxLength = 2
    const byte2 = document.createElement('input')
    byte2.type = 'text'
    byte2.maxLength = 2
    const write = document.createElement('input')
    write.type = 'button'
    write.value = device.name
    write.classList.add('write')
    write.classList.add(device.name)

    // 画面上に入力欄とボタンを表示
    div.append(byte0)
    div.append(byte1)
    div.append(byte2)
    div.append(write)
    listDiv.append(div)

    // 表示した要素を機器のオブジェクトに保存
    item.byte0Text = byte0
    item.byte1Text = byte1
    item.byte2Text = byte2
    item.div = div

    // 機器リストに入れる
    list[device.name] = item

    // 書き込みボタン押下イベントに登録
    write.addEventListener('click', writeValue)

    // 切断イベントに登録
    device.addEventListener('gattserverdisconnected', disconnect);
}
// 接続ボタン押下イベントに登録
connectButton.addEventListener('click', connect)