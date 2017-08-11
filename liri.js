var input = process.argv.slice(3).join("+").split(",");

//console.log(input);

var inputName = input[0];
var year;
// Grabs the bands variables
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require('node-spotify-api');
// Include the request npm package (Don't forget to run "npm install request" in this folder first!)
var request = require("request");
var twitter = new Twitter(keys.twitterKeys);
var spotify = new Spotify(keys.spotifyKeys);
var twitterParams = {
	q: 'curbchildrenfam',
	count:20};
var spotifyParams = {
	type: 'track',
	query: inputName};

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
// ...
// Then run a request to the OMDB API with the movie specified
var omdbURL = "http://www.omdbapi.com/?t=" + inputName + "&y=" + year + "&plot=short&apikey=40e9cece";

switch(process.argv[2]){
	case "my-tweets":

		twitter.get('search/tweets',twitterParams,function(error, tweets, response) {
	  
			if (!error) {
				tweets = tweets.statuses;
				for (var i = 0; i < tweets.length; i++) {
					console.log((i+1) + ": " + tweets[i].text);
					console.log("");
					console.log("Created: " + tweets[i].created_at);
					console.log("--------------------------------------------");
				}
			}
			else{
				console.log(error);
			}

		});//end of get
		break;
	case "spotify-this-song":

		spotify.search(spotifyParams, function(err, data) {
		
			if (err) {
				return console.log('Error occurred: ' + err);
			}

			inputName = titleCase(inputName.replace(/\+/g," "));
			
			for (i=0;i<5;i++){

				console.log("----------------------");
				console.log((i+1) + ". " + data.tracks.items[i].artists[0].name);
				console.log(inputName);
				console.log(data.tracks.items[i].album.name);
				console.log(data.tracks.items[i].external_urls.spotify);
				console.log("----------------------")

			}

		});

		break;
	case "movie-this":

		request(omdbURL, function(error, response, body) {

		// If the request is successful (i.e. if the response status code is 200)
		if (!error && response.statusCode === 200) {

			// Parse the body of the site and recover just the imdbRating
			// (Note: The syntax below for parsing isn't obvious. Just spend a few moments dissecting it).
			var thisJSON = JSON.parse(body);

			console.log("");
			console.log("-------------");
			console.log("Title: " + thisJSON.Title);
			console.log("Rated: " + thisJSON.Rated);
			console.log("Released: " + thisJSON.Released);
			console.log("IMDB Rating: " + thisJSON.Ratings.Value);
			console.log("Rotten Tomatoes Rating: " + thisJSON.Value);
			console.log("Country: " + thisJSON.County);
			console.log("Language: " + thisJSON.Language);
			console.log("Plot: " + thisJSON.Plot);
			console.log("Actors: " + thisJSON.Actors);
			console.log("-------------");
			}
		});//end of if
		break;

}//end if (replace with switch statement)