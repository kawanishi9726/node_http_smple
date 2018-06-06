//server.js
const http = require('http');
const querystring = require('querystring');
var url = require('url');

//同じディレクトリのsettingファイルをrequire
const settings = require('./setting') 
const server = http.createServer();

console.log(settings); 

//nedbの設定
const nedb = require('nedb');
const scheduleDB = new nedb({ 
    filename: 'db/schedule.db',
    autoload: true
});
const accountDB = new nedb({
    filename: 'db/account.db',
    autoload: true
})


server.on('request', function(req, res) {

	//scheduleのapi
	console.log(req.url.split("?"))
	/*
	json設計
	schedule{
		accountId,
		title,
		date
	}
	post時の認証用
	account{
		id,
		pass
	}
	*/
	if("/schedule"==req.url.split("?")[0]){
		//postの場合はidで参照してそのidに関するscheduleをupdateする
		if(req.method== "POST"){
			var data = '';
			//reqestbodyをjsonに整形
			req.on('data', function(chunk) {
				data += chunk;
				body =  querystring.parse(data);
			});
			//返信
			req.on('end', function () {
				//必要なパラメータが揃っているかチェック
				if(!checkSchedulePost(body)){
					res.writeHead(400, {'Content-Type' : 'text/plain'});
					res.end("リクエストパラメータを確認しください\nPlease check the request parameters");
				//認証
				}else{
					success = function() {
						res.writeHead(200, {'Content-Type' : 'text/plain'});
						res.end('スケジュールを登録しました\n');
					}
					failure = function() {
						res.writeHead(400, {'Content-Type' : 'text/plain'});
						res.end("idとpassを確認してください\nPlease check id and pass");
					}

					createScheduleDB(body,success,failure)
				}
			});
		//post以外の場合はidで参照してそのidに関するscheduleを返す
		}else{
			//reqestをjsonに整形
			const query = url.parse(req.url,true).query
			console.log(query)
			req.on('data', function(chunk) {
			});

			req.on('end', function () {
				success = function(schedule) {
					res.writeHead(200, {'Content-Type' : 'text/plain'});
					res.end(JSON.stringify(schedule));
				}
				failure = function() {
					res.writeHead(200, {'Content-Type' : 'text/plain'});
					res.end("idを確認してください\nPlease check id");
				}

				readScheduleDB(query,success,failure)
			});
		}
	//Account作成
	}else if("/account"==req.url.split("?")[0]){
		if(req.method== "POST"){
			var data = '';
			req.on('data', function(chunk) {
				data += chunk;
				body =  querystring.parse(data);
			});
			//account作成の処理
			//既存のaccountを調べて一致がないか確かめて登録
			req.on('end', function () {
				if(!checkNewAccountPost(body)){
					res.writeHead(400, {'Content-Type' : 'text/plain'});
					res.end('パラメータを確認してください\n');
				}else{
					success = function() {
						res.writeHead(200, {'Content-Type' : 'text/plain'});
						res.end('アカウントを作成しました\n');
					}
					failure = function() {
						res.writeHead(400, {'Content-Type' : 'text/plain'});
						res.end('このidは登録済みです\n');
					}
					createAccountDB(body,success,failure)
				}
			});
		}else{
			req.on('data', function(chunk) {
			});

			req.on('end', function () {
				res.writeHead(400, {'Content-Type' : 'text/plain'});
				res.end('getには対応してないぜ\n');
			});
		}
	}else{
		req.on('data', function(chunk) {
		});

		req.on('end', function () {
			res.writeHead(400, {'Content-Type' : 'text/plain'});
			res.end('このurlは何もないぜ\n');
		});
	}
})

//必要なパラメータが揃っていればtrue
function checkSchedulePost(schedule){
	if(schedule.id === undefined){
		return(false);
	}else if(schedule.pass === undefined){
		return(false);
	}else if(schedule.title === undefined){
		return(false);
	}else if(schedule.date === undefined){
		return(false);
	}else{
		var date = new Date(schedule.date);
		date.constructor
		if(!date){
			return(false)
		}
		return(true);
	}
};

//idとpassを認証
function authentication(body,successfunc,failurefunc){
	console.log("tes")
	console.log(body)
	//アカウントとパスが見つかれば
	accountDB.find({"id":body.id,"pass":body.pass}, function(err, docs){
		console.log(docs.length)
		if(docs.length > 0){
			successfunc();
		}else{
			failurefunc();
		}
	});
}
//スケジューールを作成する
//同じ時間に登録される場合は上書き
function createScheduleDB(body,successfunc,failurefunc){

	success = function(){
		newSchedule = {
			accountId : body.id,
			title : body.title,
			text : body.text,
			date : body.date
		}
		console.log(newSchedule)

		scheduleDB.remove({"accountId":body.id,"date":newSchedule.date}, {}, function(err, docs){
			scheduleDB.insert(newSchedule, function(err) {
				successfunc();
				console.log(err)
			});
		});
	}
	authentication(body,success,failurefunc);
}

//必要なパラメータが揃っているかチェック
function checkNewAccountPost(body){
	if(body.id === undefined){
		return(false);
	}else if(body.pass === undefined){
		return(false);
	}else{
		return(true);
	}
}

//新しいアカウントを作成する
function createAccountDB(body,successfunc,failurefunc){
	newaccount = {
		id : body.id,
		pass : body.pass
	}
	accountDB.find({"id":newaccount.id}, function(err, docs){
		if(docs.length == 0){
			console.log(newaccount)
			accountDB.insert(newaccount, function(err) {
				successfunc();
				console.log(err)
			});
		}else{
			failurefunc();
		}
	});
}

//そのidについて登録されているスケジュールを検索
function readScheduleDB(body,successfunc,failurefunc){
	if(!Array.isArray(body.id)){
		body.id = [body.id];
	}
	scheduleDB.find({"accountId":{ $in: body.id }}, function(err, docs){
		if(docs.length > 0){
			var schedule = [];
			for(i in docs){
				schedule.push({"title":docs[i].title,"text":docs[i].text,"date":docs[i].date})
			}
			successfunc(schedule);
		}else{
			failurefunc();
		}
	});

}

server.listen(settings.port,settings.host)