var inputName;
var year;
// Load the NPM Package inquirer
var inquirer = require("inquirer");
// Grabs the bands variables
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require('node-spotify-api');
// Include the request npm package (Don't forget to run "npm install request" in this folder first!)
var request = require("request");
var fs = require('fs');
var twitter = new Twitter(keys.twitterKeys);
var spotify = new Spotify(keys.spotifyKeys);
var twitterParams = {
	q: 'curbchildrenfam',
	count:20};

function titleCase(string){

        var titleArr = string.split(" ")
        //loops through movie title array and splits words into
        //first letter and the remainder of the word
        for (i=0;i<titleArr.length;i++){
          //first letter is uppercased
          var upper = titleArr[i][0].toUpperCase();
          //rest of word is the string sliced at index 1
          var rest = titleArr[i].slice(1).toLowerCase();
          //word string recombined and replaces original word from .split array
          titleArr[i] = upper + rest;
        }        
        //once loop through title array complete, individual words of title are recombined with " " inbetween.
        var title = titleArr.join(" ")

        return title;
};
//myTweets function
function myTweets(){
	twitter.get('search/tweets',twitterParams,function(error, tweets, response) {
			var masterArr = [];
		if (!error) {
			tweets = tweets.statuses;
			for (var i = 0; i < tweets.length; i++) {

				var outputArr = [
				(i+1) + ": " + tweets[i].text,
				"",
				"Created: " + tweets[i].created_at,
				"--------------------------------------------"];

				for(j=0;j<outputArr.length;j++){
					console.log(outputArr[j]);
					masterArr.push(outputArr[j]);
				}//end of inner for loop
			}//end of outer for loop
		var stream = fs.createWriteStream("log.txt",
			{ flags: 'a',
			encoding: null,
			mode: 0666});
		stream.on('error', console.error);
		masterArr.forEach((str) => { 
			stream.write(str + '\n'); 
		});//end forEach loop
		stream.end();
		}//end if statement
		else{
			console.log(error);
		}//end else statement
	continueLiri();
	});//end of get
}//end myTweets();
//doWhatSays function
function doWhatSays(){
	fs.readFile('random.txt', 'utf8', function(err, data) {

		if (err) {
			return console.log(err);
		}
		var doChoiceArr = data.replace(/"/g,"").split(",");
		var choiceArrOne;

		if(!doChoiceArr[1]){
			choiceArrOne = "";
		}
		else{
			choiceArrOne = doChoiceArr[1];
		}

		switch(doChoiceArr[0]){
			case "movie-this":
				movieThis(choiceArrOne);
				break;
			case "spotify-this-song":
				spotifyThis(choiceArrOne);
				break;
			case "my-tweets":
				myTweets();
				break;
		}
	});//end readFile
};//end doWhatSays();

//spotifyThis function
function spotifyThis(inputName){
	if(inputName === ""){
		inputName = "Never+Gonna+Give+You+Up";
	}

	var spotifyParams = {
		type: 'track',
		query: inputName
	};

	//console.log(spotifyParams)
	var masterArr = [];

	spotify.search(spotifyParams, function(err, data) {

	if (err) {
		return console.log('Error occurred: ' + err);
	}

	inputName = titleCase(inputName.replace(/\+/g," "));

	for (i=0;i<5;i++){

		var outputArr = [
			"----------------------",
			(i+1) + ". " + data.tracks.items[i].artists[0].name,
			inputName,
			data.tracks.items[i].album.name,
			data.tracks.items[i].external_urls.spotify,
			"----------------------",
		];

		
		for(j=0;j<outputArr.length;j++){
			console.log(outputArr[j]);
			masterArr.push(outputArr[j]);
		}

	}

	var stream = fs.createWriteStream("log.txt",
		{
			flags: 'a',
			encoding: null,
			mode: 0666
		});
		stream.on('error', console.error);
		masterArr.forEach((str) => { 
			stream.write(str + '\n'); 
		});//end forEach
	stream.end();
	continueLiri();
	});//end search
}//end spotifyThis();

//movieThis function
function movieThis(inputName,year){

	if(inputName === ""){
		inputName = "Blade+Runner";
	}

	var omdbURL = "http://www.omdbapi.com/?t=" + inputName + "&y=" + year + "&plot=short&apikey=40e9cece";
	//console.log(omdbURL)
	request(omdbURL, function(error, response, body) {
		// If the request is successful (i.e. if the response status code is 200)
		if (!error && response.statusCode === 200) {

			var thisJSON = JSON.parse(body);

			var outputArr = ["",
				"-------------",
				"Title: " + thisJSON.Title,
				"Rated: " + thisJSON.Rated,
				"Released: " + thisJSON.Released,
				"IMDB Rating: " + thisJSON.Ratings[0].Value,
				"Rotten Tomatoes Rating: " + thisJSON.Ratings[1].Value,
				"Country: " + thisJSON.Country,
				"Language: " + thisJSON.Language,
				"Plot: " + thisJSON.Plot,
				"Actors: " + thisJSON.Actors,
				"-------------"
			];

			for(i=0;i<outputArr.length;i++){
				console.log(outputArr[i]);
			}

			var stream = fs.createWriteStream("log.txt",
				{
					flags: 'a',
					encoding: null,
					mode: 0666 
				});
				stream.on('error', console.error);
				outputArr.forEach((str) => { 
					stream.write(str + '\n'); 
				});
			stream.end();
		}//end of if
		continueLiri();
	});//end of request
};//end movieThis();

//switchify function
function switchify(choice){
	switch(choice){//complete switch with prompt for more info when necessary
		case "movie-this":
			inquirer.prompt([
				{
					type:"input",
					message: "What movie shall I look up for you?",
					name: "movie"
				},
				{
					type:"input",
					message: "What year? (Hit enter if not sure.)",
					name: "year"
				}
			]).then(function(resp){
				movieThis(resp.movie,resp.year);
			})
			break;
		case "spotify-this-song":
			inquirer.prompt([
				{
					type:"input",
					message: "What song shall I look up for you?",
					name: "song"
				}
			]).then(function(resp){
				spotifyThis(resp.song);
			});//end then
			break;
		case "do-what-it-says":
			doWhatSays();
			break;
		case "my-tweets":
			myTweets();
			break;
	}//end switch statement
};//end switchify();

//function continue
function continueLiri(callback){
	function goodbye(){
		console.log("Goodbye...")
	};
	function waitThis(){
			inquirer.prompt([
				{
					type:"list",
					message:"Anything else I can do for you?",
					choices:["Yes","No"],
					name:"yesNo"
				}
			]).then(function(response){
				if(response.yesNo === "Yes"){
					startPrompt();
				}
				else{
					setTimeout(goodbye,1000);
					fs.writeFile('log.txt',"", function (err) {
					  if (err) throw err;
					});
				}
			});//end inner inquirer prompt call
		};
	setTimeout(waitThis,1000);
}//end continue();

//startPrompt function
function startPrompt(callback){
	inquirer.prompt([//make into function and use recursion to keep calling until user chooses to stop	
		{
	      type: "list",
	      message: "What can I do for you?",
	      choices: ["my-tweets", "spotify-this-song", "movie-this","do-what-it-says"],
	      name: "choice"
	    }
	]).then(function(response){
		fs.appendFile('log.txt', response.choice + '\n', function (err) {
		  if (err) throw err;
		});
		switchify(response.choice);
	});//end prompt call
};//end startPrompt function
startPrompt();