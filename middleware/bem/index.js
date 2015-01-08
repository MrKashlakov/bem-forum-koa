var _ = require('underscore');
var TemplateController = require('./template');

module.exports = function* (next) {
	var template = new TemplateController({});
	var html = yield template.run(_.extend({block: 'page'}, this.viewBag.__data), this)
	/*template.run(_.extend({block: 'page'}, this.viewBag.__data), this).then(function (html) {
		console.log(html);
	}).fail(function (err) {
		console.log(err.stack);
	});*/

	this.body = html;
	return yield next;
};