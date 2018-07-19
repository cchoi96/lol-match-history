// METHOD
// 1. Get summoner name.
// 2. Get account ID from summoner name.
// 3. Get match IDs from account ID
// 4. Create Game class to hold summoner data.
// 5. Get summoner data from individual match data.
// 6. Use summoner data in Game class.

var express = require('express');
var app = express();
var router = express.Router();
var https = require('https');

// CONSTANTS

apiKey = 'RGAPI-5860e978-d803-4e5a-b71c-5d12e0fef2c2';
hostUrl = 'na1.api.riotgames.com';
currentPatch = '8.14';

// SUMMONER NAME => ACCOUNT ID
router.get('/summoner/info', function(req, res, next) {

	var params = {
		host: hostUrl,
		path: `/lol/summoner/v3/summoners/by-name/${req.query.summonername}`,
		headers: {
			'X-Riot-Token': apiKey
		}
	};

	var req = https.get(params, function(response) {
		if (response.statusCode == 403 || response.statusCode == 404) {
			return res.json(0);
		}
		console.log(`Status: ${response.statusCode}`);
		console.log('Successfully retrieved summoner info!')

		// BUFFERING THE DATA
		var data = [];

		response.on('data', function(chunk) {
			data.push(chunk);
		}).on('end', function() {
			var body = Buffer.concat(data);
			res.json(JSON.parse(body).accountId);
		})
	});

	req.on('error', function(error) {
		console.log(`Error: ${error.message}`);
		console.log('Unsuccessfully retrieved summoner info :(');
		res.json(0);
	});

});

// ACCOUNT ID => MATCH IDS

router.get('/summoner/matchlist', function(req, res, next) {

	var params = {
		host: hostUrl,
		path: `/lol/match/v3/matchlists/by-account/${req.query.accountid}?endIndex=10`,
		headers: {
			'X-Riot-Token': apiKey
		}
	};

	var req = https.get(params, function(response) {
		if (response.statusCode == 403 || response.statusCode == 404) {
			return res.json(0);
		}
		console.log(`Status: ${response.statusCode}`);
		console.log('Successfully retrieved matchlist data!');

		var data = [];
		response.on('data', function(chunk) {
			data.push(chunk);
		}).on('end', function() {
			var body = Buffer.concat(data);
			var matchArray = JSON.parse(body).matches;
			var array = [];

			// Adding Match history game IDs to custom array
			for (var i = 0; i < matchArray.length; i++) {
				array[i] = matchArray[i].gameId;		
			}
			res.send(array);
		})
	});

	req.on('error', function(error) {
		console.log(`Error: ${error.message}`);
		res.json(0);
	});

});

// GAME CLASS

class Game {
	constructor(win, duration, spells, champion, kda, items, level, cs, cspm) {
		this.win = win;
		this.duration = duration;
		this.spells = spells;
		this.champion = champion;
		this.kda = kda;
		this.items = items;
		this.level = level;
		this.cs = cs;
		this.cspm = cspm;
	}
}


