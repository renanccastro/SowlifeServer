var mongodb = require('./mongo_db.js');
var jwt = require('jwt-simple');
var ObjectID = require('mongodb').ObjectID;
var utils = require('./utils.js');
require('./config.js');

module.exports.getProfile = function(request, res) {
	console.log("token: " + request.headers.token);
	console.log("secret: " + tokenSecret);
	var decoded = jwt.decode(request.headers.token, tokenSecret);

	if (!decoded || !decoded.userid) {
		res.send(403);
		return;
	}
	console.log(request.params.id);
	var targetUserId = utils.sanitizedUserID(request.params.id);
	console.log(targetUserId)
	var lastModified = new Date(request.query.lastModified);
	console.log("LastModified get profile with date: " + lastModified + "\n");
	request.db.collection('users', function(er, collection) {
		var query = {
			'_id': targetUserId,
			'LastModified': {
				$gt: lastModified
			}
		};
		console.log(JSON.stringify(query));
		collection.findOne(query, function(er, user) {
			if (er || user == null) {
				console.log(user);
				console.log(er);
				res.send(404);
				return;
			}
			var response = {};
			response._id = user._id;
			response.name = user.name;
			response.email = user.email;
			response.gender = user.gender;
			response.state = user.state;
			response.city = user.city;
			response.country = user.country;
			response.photo = user.photo;
			response.LastModified = user.LastModified;
			response.denomination = user.denomination;
			res.json(response);
		});
	});

}

module.exports.setDevice = function(request, res) {
	var decoded = jwt.decode(request.headers.token, tokenSecret);

	if (!decoded || !decoded.userid) {
		res.send(403);
		return;
	}
	var userid = utils.sanitizedUserID(decoded.userid);

	request.db.collection('users', function(er, collection) {
		collection.update({
			"_id": userid
		}, {
			$set: {
				"device": request.body.device
			}
		}, function(err, response) {
			if (!err) res.send(200);
			else res.send(404);
		});
	});
}

module.exports.editProfile = function(request, res) {
	var decoded = jwt.decode(request.headers.token, tokenSecret);

	if (!decoded || !decoded.userid) {
		res.send(403);
		return;
	}
	var userid = utils.sanitizedUserID(decoded.userid);
	var variablesToEdit = request.body;
	variablesToEdit["LastModified"] = new Date();

	request.db.collection('users', function(er, collection) {
		collection.update({
			"_id": userid
		}, {
			$set: variablesToEdit
		}, function(err, response) {
			if (!err) {
				res.json({
					"status": 200
				});
			} else {
				res.send({
					"status": 404
				});
				console.log(err);
			}
		});
	});
}
