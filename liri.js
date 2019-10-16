require("dotenv").config();
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs")
var stringifyObject = require('stringify-object');
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

var cmd = process.argv[2];
var queryName = process.argv.slice(3).join(" ");

function actions(cmd, queryName){
    switch(cmd) {
        case "spotify-this-song":
            spotifySearch(queryName)
            break;
        case "concert-this":
            concertSearch(queryName)
            break;
        case "movie-this":
            movieSearch(queryName)
            break;
        case "do-what-it-says":
            doWhat()
            break;
    };
};

function spotifySearch(queryName) {
    if(!queryName){
        queryName = "the sign";
    }
    spotify.search({ type: 'track', query: queryName })
        .then(function(response) {
            var spotifyPath = response.tracks.items;
            for(var a = 0; a < spotifyPath.length; a++){
                output = {
                    "songName": spotifyPath[a].name,
                    "artists": "",
                    "previewLink": spotifyPath[a]["preview_url"],
                    "album": spotifyPath[a]["album"]["name"]
                }
                for(var item = 0; item < (spotifyPath[a].artists).length; item++){
                    output.artists += spotifyPath[a].artists[item].name
                    if (item < (spotifyPath[a].artists).length - 1) {
                        output.artists += ", "
                    }
                    
                }
                console.log(output)
                fs.appendFile("log.txt", "searchTerm: " + queryName + "\n" + stringifyObject(output)+ "\n", function(err) {
                    if (err) {
                        return console.log(err);
                    }
                });
                
            }
            })
            .catch(function(err) {
            console.log(err);
            });
            
}

function concertSearch(queryName) {
    axios.get("https://rest.bandsintown.com/artists/" + queryName + "/events?app_id=codingbootcamp")
    .then(function(response){
        var venueData = response.data;
        for(var v = 0; v < venueData.length; v++){
            var date = venueData[v].datetime
            output = {
                "venueName": venueData[v].venue.name,
                "venueCity": venueData[v].venue.city,
                "venueState": venueData[v].venue.region,
                "venueCountry": venueData[v].venue.country,
                "eventDate": moment(date).format("L")
            }
            console.log(output)
            fs.appendFile("log.txt", "searchTerm: " + queryName + "\n" + stringifyObject(output)+ "\n", function(err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    })
    .catch(function(error) {
        console.log(error);
    });
};

function movieSearch(queryName) {
    if(!queryName){
        queryName = "Mr. Nobody"
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + queryName + "&apikey=trilogy";

    console.log(queryUrl);
    
    axios.get(queryUrl).then(
      function(response) {
        var resp = response.data
        omdbOutput = {
            "title": resp.Title,
            "year": resp.Year,
            "imdbRating": resp.Ratings[0].Value,
            "rottenTomatoesRating": resp.Ratings[1].Value,
            "country": resp.Country,
            "language": resp.Language,
            "plot": resp.Plot,
            "actors": resp.Actors
        }
        console.log(omdbOutput)
        fs.appendFile("log.txt", "searchTerm: " + queryName + "\n" + stringifyObject(omdbOutput)+ "\n", function(err) {
            if (err) {
                return console.log(err);
            }
        });
      })
      .catch(function(error) {
        if (error.response) {
          console.log("---------------Data---------------");
          console.log(error.response.data);
          console.log("---------------Status---------------");
          console.log(error.response.status);
          console.log("---------------Status---------------");
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
}

function doWhat(){
    fs.readFile("./random.txt", "utf8", function(error, data) {
        if (error) {
          return console.log(error);
        }
        data = data.split(",");
        actions(data[0], data[1]);
      
      });
      
}
actions(cmd, queryName);