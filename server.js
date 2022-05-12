const http = require('http');
const querystring = require('querystring');
const crypto = require('crypto');
const discord = require('discord.js');
const client = new discord.Client();

const mainChannelId = "973609374788501547";
const debugChannelId = "973609374788501547";
const password = "potatoisgodpotatoisgodpotatoisgod";

http.createServer(function(req, res){
  if (req.method == 'POST'){
    var data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        console.log("No post data");
        res.end();
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type == "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }
      if(dataObject.hash === undefined || dataObject.nonce === undefined){
        console.log("undefined hash");
        res.end();
        return;
      }else{
        let serverHash = crypto.createHash('sha256').update(password + Math.floor(dataObject.nonce)).digest('hex');
        if(String(dataObject.hash) != serverHash){
          console.log("invalid hash");
          res.end();
          return;
        }else{
          console.log("nonce:" + Math.floor(dataObject.nonce));
          console.log("hash ok");
        }
      }
      if(dataObject.type == "announce"){
        let msgChannelId = debugChannelId;
        if(dataObject.debug !== undefined && dataObject.debug == "false"){
          msgChannelId = mainChannelId;
        }
        let emb = {embed: JSON.parse(dataObject.content)};
        sendMsg(msgChannelId, "", emb);
      }
      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', message =>{
  console.log('Bot準備完了～');
  client.user.setPresence({ game: { name: 'げーむ' } });
});

client.on('message', message =>{
  if (message.author.id == client.user.id || message.author.bot){
    return;
  }

  //ぴえんの例
  if (message.content.match(/🥺/)){
    let react = '🥺';
    message.react(react)
      .then(message => console.log("リアクション: 🥺"))
      .catch(console.error);
  }

  if (message.content === "にゃ～ん"){
    let reply_text = "にゃ～ん";
    message.reply(reply_text)
      .then(message => console.log("Sent message: " + reply_text))
      .catch(console.error);
    return;
  }

  if (message.isMemberMentioned(client.user) && message.content.match(/予想/) && message.content.match(/頭/)){
    console.log(message.content);
    const num_uma =  Number(message.content.replace(/[^0-9]/g, ''));
    console.log("予想 頭数："+num_uma);
    lotteryRace(message.channel.id,num_uma);
  }

  if ((message.content.match(/^！シャイニー/)) ||
      (message.isMemberMentioned(client.user) && message.content.match(/シャイニー/))){
    // let arr = ["大吉", "吉", "凶", "ぽてと", "にゃ～ん", "しゅうまい君"];
    // let weight = [5, 30, 10, 15, 20, 20];
    lotteryByWeight(message.channel.id);
  }
});

client.on('voiceStateUpdate', (oldGuildMember, newGuildMember) =>{
  if(oldGuildMember.voiceChannelID === undefined && newGuildMember.voiceChannelID !== undefined){
    if(client.channels.get(newGuildMember.voiceChannelID).members.size == 1){
      if (newGuildMember.voiceChannelID == "725595164105768984") {
        newGuildMember.voiceChannel.createInvite({"maxAge":"0"})
          .then(invite => sendMsg(
            mainChannelId, "<@" + newGuildMember.user.id +"> が通話を開始しました！\n" + invite.url
          ));
      }
    }
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined){
  console.log('DISCORD_BOT_TOKENが設定されていません。');
  process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

function lottery(channelId, arr){
  let random = Math.floor(Math.random() * arr.length);
  sendMsg(channelId, arr[random]);
}

function lotteryRace(channelId,num_uma){
  sendMsg(channelId, race(num_uma));
  console.log("lotteryrace error");
}

function lotteryByWeight(channelId){
  let lotresult = "シャイニースターV 1BOXを開封した結果：\n```\n"+sr() +"\n"+ ssr()+"\n" + ur()+"```\n";
  sendMsg(channelId, lotresult);
  console.log("lottery error");
}

function race(num_uma) {
  let fir = Math.floor(Math.random() * num_uma)
  let sec = 0
  let thi = 0
  console.log(fir);
  while (true) {
    sec = Math.floor(Math.random() * num_uma) 
    if (fir != sec) {
      break
    }    
  }
  while (true) {
    thi = Math.floor(Math.random() * num_uma) 
    if (thi != sec && thi != fir) {
      break
    }    
  }
  return fir.toString(10) + "-" + sec.toString(10) + "-" + thi.toString(10)
  // 1等や2等などを設定した確率で表示
}

function sr() {
  const data = {
    'SRウカッツ': 6, 
'SRジムトレーナー': 6, 
'SRとりつかい': 6, 
'SRネズ': 6, 
'SRフウロ': 6, 
'SRボールガイ': 6, 
'SRポケモンごっこ': 6, 
'SRマリィ': 6, 
'SRローズ': 6, 
    // はずれ 40%
  }
  const rand = Math.floor(Math.random() * 100)
  let result = 'SRなし'
  let rate = 0
  for (const prop in data) {
    rate += data[prop]
    if (rand <= rate) {
      result = prop
      break
    }
  }
  return result
  // 1等や2等などを設定した確率で表示
}

function ur() {
  const data = {
    'URムゲンダイナV': 3, 
    'URムゲンダイナVMAX': 3, 
    'URザシアンV': 3, 
    'URザマゼンタV': 3, 
  }
  const rand = Math.floor(Math.random() * 100)
  let result = 'URなし'
  let rate = 0
  for (const prop in data) {
    rate += data[prop]
    if (rand <= rate) {
      result = prop
      break
    }
  }
  return result
  // 1等や2等などを設定した確率で表示
}

function ssr() {
  const data = {
    'SSRイエッサンV': 5, 
    'SSRウッウV': 5, 
    'SSRオーロンゲV': 5, 
    'SSRオーロンゲVMAX': 5, 
    'SSRクロバットVMAX': 5, 
    'SSRゴリランダーV': 5, 
    'SSRゴリランダーVMAX': 5, 
    'SSRストリンダーV': 5, 
    'SSRストリンダーVMAX': 4, 
    'SSRタイレーツV': 4, 
    'SSRドラパルトV': 4, 
    'SSRドラパルトVMAX': 4, 
    'SSRバイウールーV': 4, 
    'SSRパルスワンV': 4, 
    'SSRマルヤクデV': 4, 
    'SSRマルヤクデVMAX': 4, 
    'SSRメタモンV': 4, 
    'SSRメタモンVMAX': 4, 
    'SSRラプラスV': 4, 
    'SSRラプラスVMAX': 4, 
    'SSRリザードンV': 4, 
    'SSRリザードンVMAX': 4, 
    'SSRワタシラガV': 4, 
  }
  const rand = Math.floor(Math.random() * 100)
  let result = 'SSRなし'
  let rate = 0
  for (const prop in data) {
    rate += data[prop]
    if (rand <= rate) {
      result = prop
      break
    }
  }
  return result
  // 1等や2等などを設定した確率で表示
}

function sendReply(message, text){
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option={}){
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}
