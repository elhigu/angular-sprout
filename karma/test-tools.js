/** 
 * Set of helper function to make test scripts less horrible to write.
 */
var testTools = {

	// calling jQuery.click() didn't work, and phantomjs 
	// didn't have el.click()...
	click : function (el, debug){
		if (el.length) {
			el = el[0];
		}
    	var ev = document.createEvent("MouseEvent");
    	ev.initMouseEvent(
        	"click",
        	true /* bubble */, true /* cancelable */,
        	window, null,
        	0, 0, 0, 0, /* coordinates */
        	false, false, false, false, /* modifier keys */
        	0 /*left*/, null
    	);
    	if (debug) {
    		console.log("Clicked: ", el);
    	}
    	el.dispatchEvent(ev);
	},

  setVal : function (jqEl, val) {
    jqEl.val(val);
    this.fireEvent(jqEl[0], 'change');
  },

  fireEvent : function (element, event) {
    if (element.length) {
    	element = element[0];
    }
    var evt = null;
    if (document.createEvent) {
      // dispatch for firefox + others
      evt = document.createEvent("HTMLEvents");
    // event type,bubbling,cancelable
      evt.initEvent(event, true, true ); 
      return !element.dispatchEvent(evt);
    } else {
      // dispatch for IE
      evt = document.createEventObject();
      return element.fireEvent('on'+event,evt);
    }
  },

  showHtml : function (html) {
  	document.write(html);
  },

  htmlEscape : function HTMLescape(html){
    return document.createElement('div')
      .appendChild(document.createTextNode(html))
      .parentNode
      .innerHTML;
  }

};