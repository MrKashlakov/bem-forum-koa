var path = require('path');
var vow = require('vow');
var enbBuilder = require('enb/lib/server/server-middleware').createBuilder({
	cdir: process.cwd(),
	noLog: false
});
var dropRequireCache = require('enb/lib/fs/drop-require-cache');

exports.build = function (targets) {
	return vow.all(
		targets.map(function (target) {
			return enbBuilder(target).then(function () {
				dropRequireCache(require, target);
				return target;
			});
		})	
	);
};