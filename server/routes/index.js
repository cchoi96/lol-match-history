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

router.get('/summoner/match', function(req, res, next) {

	var accountid = req.query.accountid;

	var params = {
		host: hostUrl,
		path: `/lol/match/v3/matches/${req.query.matchid}`,
		headers: {
			'X-Riot-Token': apiKey
		}
	};

	var req = https.get(params, function(response) {
		if (response.statusCode == 403 || response.statusCode == 404) {
			return res.json(0);
		}
		console.log(`Status: ${response.statusCode}`);
		console.log('Successfully retrieved match data!');

	var data = [];
	
	response.on('data', function(chunk) {
		data.push(chunk);
	}).on('end', function() {
		var body = Buffer.concat(data);
		var playerId;
		var players = JSON.parse(body).participantIdentities;

		for (var i = 0; i < players.length; i++) {
			if (players[i].player.accountId ==	 accountid) {
				playerId = players[i].participantId;
				break;
			}
		}

		var playerArray = JSON.parse(body).participants;
		var duration = JSON.parse(body).gameDuration;
		var championImage = '';
		var game;

		for (var i = 0; i < playerArray.length; i++) {

			if (playerArray[i].participantId == playerId) {
				var array = playerArray[i];
				var stats = array.stats;	
				var championId = array.championId;

				var params = {
					host: 'ddragon.leagueoflegends.com',
					path: `/cdn/${currentPatch}.1/data/en_US/champion.json`,
				};

				var req = https.get(params, function(response) {
					if (response.statusCode == 403 || response.statusCode == 404) {
						return res.json(0);
					}
					console.log(`Status: ${response.statusCode}`);
					console.log('Static data successfully retrieved.');

					var data = [];
					response.on('data', function(chunk) {
						data.push(chunk);
					}).on('end', function() {
						var body = Buffer.concat(data);
						var champs = JSON.parse(body);

						for (var champ in champs.data) {
							if (champs.data[champ].key == championId) {
								championImage = champs.data[champ].image.full;
							}
						}

						game = new Game(
							stats.win, 
							`${Math.floor(duration/60).toString()}m ${(duration % 60).toString()}s`, 
							[`${array.spell1Id}.png`, `${array.spell2Id}.png`], 
							championImage, 
							((stats.kills+stats.assists)/(stats.deaths === 0 ? 1 : stats.deaths)).toFixed(1),
							[stats.item0, stats.item1, stats.item2, stats.item3, stats.item4, stats.item5, stats.item6],
							stats.champLevel, 
							stats.totalMinionsKilled,
							(stats.totalMinionsKilled/(duration/60)).toFixed(1)				
						)

						res.json(game);

					});
				});

				req.on('error', function(error) {
					console.log(`Error: ${error.message}`);
					res.json(0);
				});

			}
		}
	});
	});

	req.on('error', function(error) {
		console.log(`Error: ${error.message}`);
		res.json(0);
	});

});


router.get('/message', function(req, res, next) {
	res.json('League of Legends Match History')
})


module.exports = router;

// Some general comments..
// Would try and use the axios library next time, seems easier
// Would improve the error sections in general, not very thorough or informative
// API key expires every 24 hours, so need to refresh
