require("dotenv").config();
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs")
var inquirer = require("inquirer");
var stringifyObject = require('stringify-object');
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);




var cmd = "";
var queryName = "";


function actions(cmd, queryName){
    inquirer.prompt([
    {
        type: "list",
        message: "What would you like to do today?",
        name: "searchType",
        choices: ['Search for a song', 'Search for a movie', 'Search for a concert', 'Try something random']
    },
    {
        name: "searchTerm",
        message: "What are the terms you want to search for?"
    }
    ])
    .then(function(inquirerResponse) {
        cmd = inquirerResponse.searchType;
        queryName = inquirerResponse.searchTerm;
        console.log(cmd)
        console.log(queryName)
        switch(inquirerResponse.searchType) {
            case "Search for a song":
                spotifySearch(inquirerResponse.searchTerm)
                break;
            case "Search for a concert":
                concertSearch(inquirerResponse.searchTerm)
                break;
            case "Search for a movie":
                movieSearch(inquirerResponse.searchTerm)
                break;
            case "Try something random'":
                doWhat()
                break;
        };
    });
};

function spotifySearch(queryName) {
    if(!queryName){
        queryName = "the sign";
    }
    spotify.search({ type: 'track', query: queryName })
        .then(function(response) {
            var spotifyPath = response.tracks.items;
            var curDate = moment().format("lll");
            console.log("Search Term: " + queryName + "\n" + curDate + "\n\n")
            fs.appendFile("log.txt", "Search Term: " + queryName + "\n" + curDate + "\n\n", function(err) {
                if (err) {
                    return console.log(err);
                }
            });
            for(var a = 0; a < spotifyPath.length; a++){
                var artistList = [];
            
                for(var item = 0; item < (spotifyPath[a].artists).length; item++){
                    artistList += spotifyPath[a].artists[item].name
                    if (item < (spotifyPath[a].artists).length - 1) {
                        artistList += ", "
                    }
                    
                }
                output = [
                    "Song Name: " + spotifyPath[a].name,
                    "Artists: " +  artistList,
                    "Preview Link: " + spotifyPath[a]["preview_url"],
                    "Album Name: " + spotifyPath[a]["album"]["name"],
                    "\n --------------------------- \n"
                ].join("\n\n");

                console.log(output)
                fs.appendFile("log.txt", output + "\n", function(err) {
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
        var curDate = moment().format("lll");
        console.log("Search Term: " + queryName + "\n" + curDate + "\n\n");
        fs.appendFile("log.txt", "Search Term: " + queryName + "\n" + curDate + "\n\n", function(err) {
            if (err) {
                return console.log(err);
            }
        });
        for(var v = 0; v < venueData.length; v++){
            var date = venueData[v].datetime
            output = [
                "Venue Name: " + venueData[v].venue.name,
                "Venue City: " + venueData[v].venue.city,
                "Venue State: " + venueData[v].venue.region,
                "Venue Country: " + venueData[v].venue.country,
                "Event Date: " + moment(date).format("L"),
                "\n --------------------------- \n"
            ].join("\n\n");
            console.log(output)
            fs.appendFile("log.txt", output + "\n", function(err) {
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
        var curDate = moment().format("lll");
        console.log("Search Term: " + queryName + "\n" + curDate + "\n\n");
        fs.appendFile("log.txt", "Search Term: " + queryName + "\n" + curDate + "\n\n", function(err) {
            if (err) {
                return console.log(err);
            }
        });
        omdbOutput = [
            "Title: " + resp.Title,
            "Year: " + resp.Year,
            "IMDB Rating: " + resp.Ratings[0].Value,
            "Rotten Tomatoes Rating: " + resp.Ratings[1].Value,
            "Country: " + resp.Country,
            "Language: " + resp.Language,
            "Plot: " + resp.Plot,
            "Actors: " + resp.Actors,
            "\n --------------------------- \n"
        ].join("\n\n");
        console.log(omdbOutput)
        fs.appendFile("log.txt", omdbOutput + "\n", function(err) {
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