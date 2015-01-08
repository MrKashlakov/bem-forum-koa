var path = require('path');
var nconf = require('nconf');

var configsDir = path.resolve(process.cwd(), 'configs');

nconf
	.argv()
	.env()
	.add('common', {
		type: 'file',
		file: path.resolve(configsDir, 'common/node.json')
	})
	.add('current', {
		type: 'file',
		file: path.resolve(configsDir, 'current/node.json')
	});

module.exports = nconf;