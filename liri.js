var input = process.argv.slice(3).join("+").replace(/'/g,"\'").split(",");
var inputName = input[0]
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

fs.appendFile('log.txt', process.argv.slice(2) + '\n', function (err) {
  if (err) throw err;
});

//test of title case function

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

//end test


//check if there is year
if (input.length>1){
	year = input[1].trim().replace("+","");
}
else{
	year = "";
}

// ...fs.readFile('random.txt', 'utf8', function(err, data) {});
// Then run a request to the OMDB API with the movie specified
function switchify(choice,inputName){

	switch(choice){
		case "my-tweets":
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
						}

						/*console.log((i+1) + ": " + tweets[i].text);
						console.log("");
						console.log("Created: " + tweets[i].created_at);
						console.log("--------------------------------------------");*/
					}
				var stream = fs.createWriteStream("log.txt",
					{ flags: 'a',
					encoding: null,
					mode: 0666});
				stream.on('error', console.error);
				masterArr.forEach((str) => { 
					stream.write(str + '\n'); 
				});
				stream.end();
				}
				else{
					console.log(error);
				}

			});//end of get
			break;
		case "spotify-this-song":

			if(inputName === ""){
				inputName = "Never+Gonna+Give+You+Up";
			}

			var spotifyParams = {
				type: 'track',
				query: inputName};

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
					//console.log(masterArr)

				}

				//console.log(masterArr);

				var stream = fs.createWriteStream("log.txt",
					{ flags: 'a',
					encoding: null,
					mode: 0666});
					stream.on('error', console.error);
					masterArr.forEach((str) => { 
						stream.write(str + '\n'); 
					});
				stream.end();

			});

			break;
		case "movie-this":
			if(inputName === ""){
				inputName = "Blade+Runner";
			}

			var omdbURL = "http://www.omdbapi.com/?t=" + inputName + "&y=" + year + "&plot=short&apikey=40e9cece";
			//console.log(omdbURL)
			request(omdbURL, function(error, response, body) {

			// If the request is successful (i.e. if the response status code is 200)
			if (!error && response.statusCode === 200) {

				// Parse the body of the site and recover just the imdbRating
				// (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
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
				"-------------"];

				for(i=0;i<outputArr.length;i++){
					console.log(outputArr[i]);
				}

				var stream = fs.createWriteStream("log.txt",
					{ flags: 'a',
					  encoding: null,
					  mode: 0666 
					});
					stream.on('error', console.error);
					outputArr.forEach((str) => { 
						stream.write(str + '\n'); 
					});
				stream.end();

				}
			});//end of if
			break;
		case "do-what-it-says":
			fs.readFile('random.txt', 'utf8', function(err, data) {

				//console.log(data);

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

				switchify(doChoiceArr[0],choiceArrOne.replace(/ /g,"+"));
			});
			break;

	}//end if (replace with switch statement)
};

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

	switch(response.choice){//complete switch with prompt for more info when necessary
		case "movie-this":
			inquirer.prompt([
				{
					type:"input",
					message: "What movie shall I look up for you?",
					name: "movie"
				}
			]).then(function(resp){
				switchify(response.choice,resp.movie);
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
				switchify(response.choice,resp.song);
			})
			break;
		case "do-what-it-says":
			switchify(response.choice,"");
			break;
		case "my-tweets":
			switchify(response.choice,"");
			break;
	}
});



//switchify(process.argv[2],inputName);