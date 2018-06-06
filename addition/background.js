'use strict';
const xhr = new XMLHttpRequest();
//テスト用
var listenId = ["test","test1"]

//初期化
var schedule = [];

checkSchedule(listenId)

//テスト用
chrome.notifications.create(null, {
    type: chrome.notifications.TemplateType.BASIC,
    iconUrl: '/icon-90.png',
    title: 'Hello World!',
    message: 'お元気ですか',
});

//一定間隔でスケジュールを監視する
chrome.alarms.create('checkSchedule', { delayInMinutes : 1, periodInMinutes : 3 });
chrome.alarms.create('checkNotifications', { delayInMinutes : 1, periodInMinutes : 1 });

chrome.alarms.onAlarm.addListener(function(alarm) {
	if (alarm.name == 'checkSchedule') {
		checkSchedule(listenId)
	}
	if (alarm.name == 'checkNotifications') {
		createNotifications(schedule)
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.greeting == "schedule"){
		schedule.sort(function(a,b){
			if(a.date < b.date) return -1;
			if(a.date > b.date) return 1;
			return 0;
		});
		
		console.log(JSON.stringify(schedule))
		sendResponse({
			msg:JSON.stringify(schedule)
		});
	}
});


//画面に出すやつ登録する
function createNotifications(schedule){
	for(var i in schedule){
		//1分単位なので差が60000msのものだけ追加
		//console.log(new Date (schedule[i].date) - new Date)
		if(new Date (schedule[i].date) - new Date > -60000 && new Date (schedule[i].date) - new Date < 0){
			chrome.notifications.create(null, {
				type: chrome.notifications.TemplateType.BASIC,
				iconUrl: '/icon-90.png',
				title: schedule[i].title,
				message: schedule[i].text + schedule[i].date
			});
		}
	}
}

//idを元にスケジュールを追加する
function checkSchedule(idlist){
	var url = "http://localhost:1337/schedule?"

	for(var id in idlist){
		url += "id="+idlist[id]+"&"
	}
	xhr.open("GET", url);
	xhr.onload = function() {
		if(xhr.status==200){
			schedule = (JSON.parse(xhr.responseText));
		}
	}
	xhr.responseType = "text";
	xhr.send(null);
}
