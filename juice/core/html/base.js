define('html', ['html/element', 'html/view', 'html/grid', 'html/table', 'stylesheet'], function View( HtmlElement, HtmlView, Grid, Table, stylesheet ){
	
	var exports = this.exports;
	var global = this.global;

	exports.Element = HtmlElement;
	exports.View = HtmlView;
	exports.grid = Grid;
	exports.Table = Table;

	exports.stylesheet = stylesheet;
	
	return exports;
	
});