(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['loadingOverlay'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "\n<div id=\"cb-loading-overlay\" class=\"cb-control\"></div>\n";
  });
templates['navigateLeft'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "\n<div data-trigger=\"click\" data-action=\"drawPrevPage\" class=\"cb-control navigate navigate-left\"></div>\n";
  });
templates['navigateRight'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "\n<div data-trigger=\"click\" data-action=\"drawNextPage\" class=\"cb-control navigate navigate-right\"></div>\n";
  });
templates['progressbar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "<div id=\"cb-status\" class=\"cb-control\">\n	<div id=\"cb-progress-bar\">\n		<div class=\"progressbar-value\"></div>\n	</div>\n</div>\n";
  });
templates['toolbar'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
helpers = helpers || Handlebars.helpers; data = data || {};
  


  return "\n<div class=\"toolbar\">\n\n	<ul class=\"pull-left\">\n		<li>\n			<button data-trigger=\"click\" data-action=\"close\" title=\"close\" class=\"icon-remove-sign\"></button>\n		</li>\n		<li class=\"separator\"></li>\n		<li>\n			<button title=\"image settings\" class=\"icon-settings\"></button>\n			<div class=\"dropdown\">\n				<form name=\"image-enhancements\" data-trigger=\"reset\" data-action=\"resetEnhancements\">\n					<div class=\"sliders\">\n						<div class=\"control-group\">\n							<label title=\"adjust brightness\" class=\"icon-sun\"></label>\n							<input data-trigger=\"change\" data-action=\"brightness\" type=\"range\" min=\"-100\" max=\"100\" step=\"1\" value=\"0\">\n						</div>\n						<div class=\"control-group\">\n							<label title=\"adjust contrast\" class=\"icon-adjust\"></label>\n							<input data-trigger=\"change\" data-action=\"contrast\" type=\"range\" min=\"-1\" max=\"1\" step=\"0.1\" value=\"0\">\n						</div>\n						<div class=\"control-group\">\n							<label title=\"sharpen\" class=\"icon-droplet\"></label>\n							<input data-trigger=\"change\" data-action=\"sharpen\" type=\"range\" min=\"0\" max=\"1\" step=\"0.1\" value=\"0\">\n						</div>\n					</div>\n					<div class=\"control-group pull-left\">\n						<input id=\"image-desaturate\" type=\"checkbox\" data-trigger=\"change\" data-action=\"desaturate\">\n						<label for=\"image-desaturate\">desaturate</label>\n					</div>\n					<div class=\"control-group pull-right\">\n						<input type=\"reset\" value=\"reset\">\n					</div>\n				</form>\n			</div>\n		</li>\n		<li>\n			<button data-trigger=\"click\" data-action=\"toggleLayout\" title=\"toggle one/two pages at a time\" class=\"icon-file\"></button>\n		</li>\n		<li>\n			<button data-trigger=\"click\" data-action=\"zoomOut\" title=\"zoom out\" class=\"icon-zoom-out\"></button>\n		</li>\n		<li>\n			<button data-trigger=\"click\" data-action=\"zoomIn\" title=\"zoom in\" class=\"icon-zoom-in\"></button>\n		</li>\n		<li>\n			<button data-trigger=\"click\" data-action=\"fitWidth\" title=\"fit page to window width\" class=\"icon-expand\"></button>\n		</li>\n	</ul>\n\n	<ul class=\"pull-right\">\n		<li><span id=\"current-page\"></span> / <span id=\"page-count\"></span></li>\n	</ul>\n\n</div>\n";
  });
})();