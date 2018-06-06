console.log("I am popup.js");

chrome.runtime.sendMessage({greeting: "schedule"},
	function(response) {
		msg = JSON.parse(response.msg)

		for (var i in msg){

			var newDiv = document.createElement("div")
			
			var newTitle = document.createElement("H1")
			newTitle.innerText = msg[i].title
			newDiv.appendChild(newTitle);
			
			var newText = document.createElement("p")
			newText.innerText = msg[i].text
			newDiv.appendChild(newText);
			
			var newDate = document.createElement("p")
			newDate.innerText = msg[i].date
			newDiv.appendChild(newDate);
			
			document.body.insertBefore(newDiv, document.getElementById("div")); 
		}

});
