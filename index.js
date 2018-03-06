const { Wechaty, Room, Contact, MediaMessage } = require('wechaty')
const QrcodeTerminal = require('qrcode-terminal')
const bot = Wechaty.instance()

const _ = require('koa-route');
const Koa = require('koa');
const app = new Koa();

// 登录二维码
bot.on('scan', (url, code) => {
  if (!/201|200/.test(String(code))) {
  	console.log(`请扫描二维码完成登录: `)
    const loginUrl = url.replace(/\/qrcode\//, '/l/')
    QrcodeTerminal.generate(loginUrl, {small: true})
  }
  // console.log(`${url}\n[${code}] Scan QR Code in above url to login: `)
})

// 登录成功
.on('login', user => {
	const me = user
	console.log(`User ${user} logined`)
})

// 自动回复
.on('message', async m => {
    // await m.say('hello world')
    // console.log('Receive msg: ' + m.content())
})

app.use(async ctx => {
  ctx.body = `
      <h1>Api List</h1>
      <ul>
        <li>/send_self/:context 发送消息给登录账号</li>
        <li>/send/:username/:context    发送消息给指定好友</li>
      </ul>
  `
});

// 发消息给自己
app.use(_.get('/send_self/:context', async (ctx, context) => {
  if (!bot.logonoff()) {
    ctx.body = '主机不在线'
    return false
  }

  let contact = bot.self();
  await contact.say(context)

  ctx.body = 'ok'
}))

// 发消息给好友
app.use(_.get('/send/:username/:context', async (ctx, username, context) => {
  if (!bot.logonoff()) {
    ctx.body = '主机不在线'
    return false
  }

  let user = await Contact.find({alias: username});
  if (!user) {
    user = await Contact.find({name: username});
  }
  await user.say(context)

  ctx.body = 'ok'
}))

bot.start()
app.listen(3000)
