'use strict'

// 要素
const connectButton = document.querySelector('#connect')
const listDiv = document.querySelector('#list')

// 接続済みの機種リストのオブジェクト
const list = {}

// 値の書き込み
const write = async(e) =>
{
    // リストから機器情報を取得
    const item = list[e.target.value]

    // バイト値を書き込み
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
    // リストから機器情報を取得
    const item = list[e.currentTarget.name]

    // フォームを消す
    item.form.remove()

    // リストから機器を削除
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
    
    // 接続ボタンの見た目をNow Connectingに変更する
    connectButton.value = 'Now Connecting...'

    // 接続
    item.server = await device.gatt.connect()
    item.service = await item.server.getPrimaryService(SERVICE_UUID)
    item.characteristic = await item.service.getCharacteristic(CHARACTERISTIC_UUID)

    // フォームと入力欄とボタンを用意
    const form = document.createElement('form')
    const byte0Text = document.createElement('input')
    byte0Text.type = 'text'
    byte0Text.maxLength = 2
    const byte1Text = document.createElement('input')
    byte1Text.type = 'text'
    byte1Text.maxLength = 2
    const byte2Text = document.createElement('input')
    byte2Text.type = 'text'
    byte2Text.maxLength = 2
    const writeButton = document.createElement('input')
    writeButton.type = 'button'
    writeButton.value = device.name
    writeButton.classList.add('button')
    writeButton.classList.add(device.name)

    // 画面上に入力欄とボタンを表示
    form.append(byte0Text)
    form.append(byte1Text)
    form.append(byte2Text)
    form.append(writeButton)
    listDiv.append(form)

    // 表示した要素を機器のオブジェクトに保存
    item.byte0Text = byte0Text
    item.byte1Text = byte1Text
    item.byte2Text = byte2Text
    item.form = form

    // 機器リストに入れる
    list[device.name] = item

    // 書き込みボタン押下イベントに登録
    writeButton.addEventListener('click', write)

    // 切断イベントに登録
    device.addEventListener('gattserverdisconnected', disconnect);
    
    // 接続ボタンの見た目をConnectに戻す
    connectButton.value = 'Connect'
}

// 接続ボタン押下イベントに登録
connectButton.addEventListener('click', connect)