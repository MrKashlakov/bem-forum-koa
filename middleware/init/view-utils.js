var _ = require('underscore');
var md = require('marked');
var hljs = require('highlight.js');

module.exports = {

	mdToHtml: function (content, config) {
		config = config || {};

		return md(content, _.extend({
			breaks: true,
			sanitize: true,
			highlight: function (content) {
				return hljs.highlightAuto(content).value
			}
		}, config));
	}
};