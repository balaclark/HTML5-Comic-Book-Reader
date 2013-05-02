/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'toolbar\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-file' : '&#xe000;',
			'icon-image' : '&#xe001;',
			'icon-zoom-out' : '&#xe002;',
			'icon-zoom-in' : '&#xe003;',
			'icon-expand' : '&#xe004;',
			'icon-expand-2' : '&#xe005;',
			'icon-folder-open' : '&#xe006;',
			'icon-folder' : '&#xe007;',
			'icon-cog' : '&#xe008;',
			'icon-menu' : '&#xe009;',
			'icon-wrench' : '&#xe00a;',
			'icon-settings' : '&#xe00b;',
			'icon-loop' : '&#xe00c;',
			'icon-pin' : '&#xe00d;',
			'icon-first' : '&#xe00e;',
			'icon-last' : '&#xe00f;',
			'icon-arrow-left' : '&#xe011;',
			'icon-arrow-right' : '&#xe010;',
			'icon-arrow-left-2' : '&#xe012;',
			'icon-arrow-right-2' : '&#xe013;',
			'icon-arrow-left-3' : '&#xe014;',
			'icon-arrow-right-3' : '&#xe015;',
			'icon-previous' : '&#xe016;',
			'icon-next' : '&#xe017;',
			'icon-droplet' : '&#xe01a;',
			'icon-adjust' : '&#xf042;',
			'icon-sun' : '&#xe018;',
			'icon-remove-sign' : '&#xf057;',
			'icon-remove' : '&#xf00d;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};