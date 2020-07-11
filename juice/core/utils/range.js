define('utils/range', function(){
	
	var exports = this.exports;
	
	var doc = this.document;
	var win = this.window;
	
	function isNodeTextType(node) { return /[348]/.test(node.nodeType); }

	function getRangeAtCollapse(range, collapsed) {
		// get range as item
		if(range.item){
			var rangeItem = range.item(0);
			return { node: rangeItem };
		}
		// get range as text
		var rangeA = range.duplicate(),
		rangeB = range.duplicate(),
		i = -1,
		rangeElement, rangeNode, offset;
		// collapse the range to the start or end of the selection
		rangeB.collapse(!!collapsed);
		// get the closest available element node
		rangeElement = rangeB.parentElement();
		// read between the element and the selection
		rangeA.moveToElementText(rangeElement);
		rangeA.setEndPoint('EndToStart', rangeB);
		// get the offset despite a failure to read \r\n
		offset = rangeA.text.replace(/\r\n/gm, '\n').length;
		// get the offset between the textnodes
		while (offset > -1 && i + 1 < rangeElement.childNodes.length) 
			offset -= (rangeElement.childNodes[++i].nodeValue || rangeElement.childNodes[i].innerHTML).length;
		// hey look, the text node
		rangeNode = rangeElement.childNodes[i] || rangeElement;
		// return the data
		return {
			node: rangeNode,
			offset: String(rangeNode.nodeValue || rangeNode.innerHTML || rangeNode.value || '').length + offset
		};
	}
 
 
	function getRangeFromDocumentSelection() {
		
		var range = doc.selection.createRange(),
		rangeDataStart = getRangeAtCollapse(range, true),
		rangeDataEnd = getRangeAtCollapse(range, false);
		
		var start = {
			node: rangeDataStart.node,
			offset: rangeDataStart.offset
		},
		end = {
			node: rangeDataEnd.node,
			offset: rangeDataEnd.offset
		};
		
		exports.start = start.offset;
		exports.end = end.offset;
		
		// return the data
		return {
			node: rangeDataStart.node === rangeDataEnd.node ? rangeDataStart.node : range.parentElement(),
			start: start,
			end: end
		};
	}
	
	var rangePoint = function( el, offset){
		return { node: el, offset: offset };
	};
	
	exports.getSelection = function(){
		
		var start, end, node;
		
		if( 'getSelection' in window ){
			//console.log('getSelection');
			//console.log('getSelection in window');
			var winGetSelection = win.getSelection(), 
			docActiveElement = doc.activeElement;
			
			if('selectionStart' in docActiveElement){
				//console.log('selectionStart in docActiveElement');
				node = docActiveElement;
				start = rangePoint( docActiveElement, docActiveElement.selectionStart );
				end = rangePoint( docActiveElement, docActiveElement.selectionEnd );
			}
			
			if( winGetSelection.rangeCount ){
				//console.log('winGetSelection rangeCount');

				var range = winGetSelection.getRangeAt(0);
				node = range.commonAncestorContainer;
				start = rangePoint( range.startContainer, range.startOffset );
				end = rangePoint( range.endContainer, range.endOffset );
				if (!isNodeTextType(start.node) && start.offset > start.node.childNodes.length - 1) start.offset = start.node.innerHTML.length;
				if (!isNodeTextType(end.node) && end.offset > end.node.childNodes.length - 1) 
					end.offset = end.node.innerHTML.length;
			}
			
		}else if('selection' in doc){
		//	console.log('selection doc');
			var range = doc.selection.createRange(),
			rangeStart = getRangeAtCollapse(range, true),
			rangeEnd = getRangeAtCollapse(range, false);
			start = rangePoint( rangeStart.node, rangeStart.offset );
			end = rangePoint( rangeEnd.node, rangeEnd.offset );
			node = rangeStart.node === rangeEnd.node ? rangeStart.node : range.parentElement();
			// return the data
		}
		if( !start && !end ){
			return null;
		}else{
			return { node: node, start: start, end: end };
		}
		
		
	};
	
	
	return exports;
	
});