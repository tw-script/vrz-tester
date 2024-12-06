'use strict'

// 要素
const connectButton = document.querySelector('#connect')
const listDiv = document.querySelector('#list')

// 接続済みの機種リストのオブジェクト
const deviceObject = {}

// 値の書き込み
const write = async(e) =>
{
    // フォーム送信をキャンセル
    e.stopPropagation()
    e.preventDefault()

    // リストから機器情報を取得
    const d = deviceObject[e.target.children[3].value]

    // バイト値を書き込み
    const byte = new Uint8Array
    ([
        parseInt(e.target.children[0].value, 16),
        parseInt(e.target.children[1].value, 16),
        parseInt(e.target.children[2].value, 16),
    ])
    await d.characteristic.writeValue(byte)
}

// 切断
const disconnect = (e) =>
{
    // リストから機器情報を取得
    const d = deviceObject[e.currentTarget.name]

    // フォームを消す
    d.form.remove()

    // リストから機器を削除
    deviceObject[e.currentTarget.name] = null
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
    if(deviceObject[device.name]) return
    
    // 機器のオブジェクト
    const d = {}
    
    // 接続ボタンの見た目をNow Connectingに変更する
    connectButton.value = 'Now Connecting...'

    // 接続
    d.server = await device.gatt.connect()
    d.service = await d.server.getPrimaryService(SERVICE_UUID)
    d.characteristic = await d.service.getCharacteristic(CHARACTERISTIC_UUID)

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
    writeButton.type = 'submit'
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
    d.byte0Text = byte0Text
    d.byte1Text = byte1Text
    d.byte2Text = byte2Text
    d.form = form

    // 機器リストに入れる
    deviceObject[device.name] = d

    // 書き込みボタン押下イベントに登録
    form.addEventListener('submit', write)

    // 切断イベントに登録
    device.addEventListener('gattserverdisconnected', disconnect)
    
    // 接続ボタンの見た目をConnectに戻す
    connectButton.value = 'Connect'
}

// 接続ボタン押下イベントに登録
connectButton.addEventListener('click', connect)

// ここからは機器ではなくこのツール特有のプログラムです

// 使い方
const howToUseButton = document.querySelector('#how-to-use-button')
const howToUseDiv = document.querySelector('#how-to-use')

// 使い方開閉
const openCloseHowToUse = (e) =>
{
    howToUseButton.classList.toggle('opened')
    howToUseDiv.classList.toggle('opened')
}

// 使い方開閉ボタン押下イベントに登録
howToUseButton.addEventListener('click', openCloseHowToUse)

// リンク
const linkButton = document.querySelector('#link-button')
const linkDl = document.querySelector('#link')

// リンク開閉
const openCloseLink = (e) =>
{
    linkButton.classList.toggle('opened')
    linkDl.classList.toggle('opened')
}

// リンク開閉ボタン押下イベントに登録
linkButton.addEventListener('click', openCloseLink)
