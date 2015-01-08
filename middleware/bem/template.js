var util = require('util');
var path = require('path');
var vm = require('vm');

var _ = require('underscore');
var stringify = require('json-stringify-safe');
var vfs = require('vow-fs');
var vow = require('vow');

//TODO: Use config as module
var config = require('../../config').get('forum');


var templateController = function (options) {
	_.extend(options, {
		template: {
			level: 'desktop',
			bundle: 'index'
		}
	})
	var tmpl = options.template;
	this.target = util.format('%s.bundles/%s/%s.min.template.i18n.js', tmpl.level, tmpl.bundle, tmpl.bundle);
	if (tmpl.prefix) {
		this.target = path.join(tmpl.prefix, this.target);
	}
};

templateController.prototype.run = function (ctx, koaContext) {
	var builder = config.debug ? require('./builder') : {build : function () {
		return vow.resolve();
	}}
	var _this = this;
	return builder
		.build([_this.target])
		.then(function () {
			var context = {
				console: console,
				Vow: vow,
				req: koaContext,
				_: _
			};

			return vfs.read(path.join(process.cwd(), _this.target)).then(function (bundle) {
				vm.runInNewContext(bundle, context);
				return context;
			});
		}).then(function (template) {
			template.BEM.I18N.lang(koaContext.lang);

			return template.BEMTREE.apply(ctx)
				.then(function (bemjson) {
					if (koaContext.request.query.__mode === 'bemjson') {
						return stringify(bemjson, null, 2);
					} else if (koaContext.request.query.__mode === 'content') {
						bemjson = bemjson.content;
					}
					return template.BEMHTML.apply(bemjson);
				});
		});
};

module.exports = templateController;