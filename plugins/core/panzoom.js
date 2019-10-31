/*
 * pan/zoom controls plugin (October 30, 2019)
 */

/*global $, JS9, sprintf */

"use strict";

// create our namespace, and specify some meta-information and params
JS9.PanZoom = {};
JS9.PanZoom.CLASS = "JS9";      // class of plugins
JS9.PanZoom.NAME = "PanZoom";   // name of this plugin
JS9.PanZoom.WIDTH = 530;        // width of light window
JS9.PanZoom.HEIGHT = 125;       // height of light window
JS9.PanZoom.BASE = JS9.PanZoom.CLASS + JS9.PanZoom.NAME;

JS9.PanZoom.panzoomHTML="<div class='JS9PanZoomLinegroup'>$header</div><div class='JS9PanZoomLinegroup'>$pan&nbsp;&nbsp;$zoom&nbsp;&nbsp;$flip&nbsp;&nbsp;$rotate</div><p><div class='JS9PanZoomLinegroup'>$panto $pos1 $pos2 $wcssys $wcsunits</div>";

JS9.PanZoom.headerHTML = '';

JS9.PanZoom.panHTML = '<select class="JS9PanZoomSelect JS9PanZoomCol1" name="pan" onchange="JS9.PanZoom.xsetpan(\'%s\', \'%s\', this)">%s</select>';

JS9.PanZoom.zoomHTML = '<select class="JS9PanZoomSelect JS9PanZoomCol2" name="zoom" onchange="JS9.PanZoom.xsetzoom(\'%s\', \'%s\', this)">%s</select>';

JS9.PanZoom.flipHTML = '<select class="JS9PanZoomSelect JS9PanZoomCol3" name="flip" onchange="JS9.PanZoom.xsetflip(\'%s\', \'%s\', this)">%s</select>';

JS9.PanZoom.rotateHTML = '<select class="JS9PanZoomSelect JS9PanZoomCol4" name="rotate" onchange="JS9.PanZoom.xsetrotate(\'%s\', \'%s\', this)">%s</select>';

JS9.PanZoom.pantoHTML = '<input type="button" class="JS9PanZoomButton JS9PanZoomCol1" name="panto" value="Pan to &rarr;" onclick="javascript:JS9.PanZoom.xpanto(\'%s\', \'%s\', this)">';

JS9.PanZoom.pos1HTML = '<input type="text" class="JS9PanZoomInput JS9PanZoomCol2" name="pos1" value="%s" autocapitalize="off" autocorrect="off">';

JS9.PanZoom.pos2HTML = '<input type="text" class="JS9PanZoomInput JS9PanZoomCol3" name="pos2" value="%s" autocapitalize="off" autocorrect="off">';

JS9.PanZoom.wcssysHTML = '<select class="JS9PanZoomSelect JS9PanZoomCol4" name="wcssys" onchange="JS9.PanZoom.xsetwcssys(\'%s\', \'%s\', this)">%s</select>';

JS9.PanZoom.wcsunitsHTML = '<select class="JS9PanZoomSelect JS9PanZoomCol5" name="wcsunits" onchange="JS9.PanZoom.xsetwcsunits(\'%s\', \'%s\', this)">%s</select>';

// change pan via menu
JS9.PanZoom.xsetpan = function(did, id, target){
    const im = JS9.lookupImage(id, did);
    if( im ){
	switch(target.value){
	case "center":
	    im.setPan();
	    break;
	default:
	    break;
	}
    }
};

// change zoom via menu
JS9.PanZoom.xsetzoom = function(did, id, target){
    let arr, arr2, zval, zoom;
    const im = JS9.lookupImage(id, did);
    if( im ){
	switch(target.value){
	case "in":
	case "out":
	case "to fit":
	    zoom = im.parseZoom(target.value);
	    if( JS9.isNumber(zoom) ){
		im.setZoom(zoom);
	    }
	    break;
	default:
	    arr = target.value.split(" ");
	    if( arr.length === 2 ){
		arr2 = arr[1].split("/");
		if( arr2.length === 1 ){
		    zval = parseFloat(arr2[0]);
		    im.setZoom(zval);
		} else {
		    zval = 1 / parseFloat(arr2[1]);
		    im.setZoom(zval);
		}
	    }
	    break;
	}
    }
};

// change flip via menu
JS9.PanZoom.xsetflip = function(did, id, target){
    const im = JS9.lookupImage(id, did);
    if( im ){
	switch(target.value){
	case "around x axis":
	    im.setFlip("x");
	    break;
	case "around y axis":
	    im.setFlip("y");
	    break;
	default:
	    break;
	}
    }
};

// change rotation by 90 degrees via menu
JS9.PanZoom.xsetrotate = function(did, id, target){
    const im = JS9.lookupImage(id, did);
    if( im ){
	switch(target.value){
	case "90 left":
	    im.setRot90(90);
	    break;
	case "90 right":
	    im.setRot90(-90);
	    break;
	default:
	    break;
	}
    }
};

// change the pan to the position specified in the pos1,pos2 inputs
JS9.PanZoom.xpanto = function(did, id, target){
    let owcssys, arr, p1, p2, s1, s2, wcssys, pel, ppos;
    const im = JS9.lookupImage(id, did);
    if( im ){
	pel = $(target).parent();
	wcssys = pel.find("[name='wcssys']").val();
	s1 = pel.find("[name='pos1']").val();
	s2 = pel.find("[name='pos2']").val();
	if( JS9.isNumber(s1) && JS9.isNumber(s2) ){
	    owcssys = im.getWCSSys();
	    im.setWCSSys(wcssys);
	    p1 = JS9.saostrtod(s1);
	    if( (String.fromCharCode(JS9.saodtype()) === ":") &&
		(wcssys !== "galactic" )          	      &&
		(wcssys !== "ecliptic" )          	      ){
		p1 *= 15.0;
	    }
	    p2 = JS9.saostrtod(s2);
	    switch(wcssys){
	    case "image":
		break;
	    case "physical":
		ppos =  im.logicalToImagePos({x: p1, y: p2});
		p1 = ppos.x;
		p2 = ppos.y;
		break;
	    default:
		if( im.raw.wcs && im.raw.wcs > 0 ){
		    arr = JS9.wcs2pix(im.raw.wcs, p1, p2).trim().split(/\s+/);
		    p1 = parseFloat(arr[0]);
		    p2 = parseFloat(arr[1]);
		}
	    }
	    im.setPan(p1, p2);
	    im.setWCSSys(owcssys);
	}
    }
};

// change the wcs system
JS9.PanZoom.xsetwcssys = function(did, id, target){
    let owcssys, owcsunits, pel, pos1, pos2;
    let nwcssys = target.value;
    const im = JS9.lookupImage(id, did);
    if( im ){
	owcssys = im.getWCSSys();
	owcsunits = im.getWCSUnits();
	switch(nwcssys){
	case "degrees":
	case "sexagesimal":
	case "pixels":
	    im.setWCSUnits(nwcssys);
	    im.tmp.wcsunitsPanZoom = nwcssys;
	    break
	default:
	    im.setWCSSys(nwcssys);
	    im.tmp.wcssysPanZoom = nwcssys;
	    break;
	}
	pos1 = JS9.PanZoom.getPos(im, "x");
	pos2 = JS9.PanZoom.getPos(im, "y");
	pel = $(target).parent();
	pel.find("[name='pos1']").val(pos1);
	pel.find("[name='pos2']").val(pos2);
	if( im.getWCSUnits() !== (im.tmp.wcsunitsPanZoom||owcsunits) ){
	    JS9.PanZoom.xsetwcsunits(did, id, {value: im.getWCSUnits()});
	}
	im.setWCSSys(owcssys);
	im.setWCSUnits(owcsunits);
    }
}

// change the wcs units
JS9.PanZoom.xsetwcsunits = function(did, id, target){
    let owcssys, owcsunits, pel, pos1, pos2;
    let nwcsunits = target.value;
    const im = JS9.lookupImage(id, did);
    if( im ){
	owcsunits = im.getWCSUnits();
	owcssys = im.getWCSSys();
	im.setWCSUnits(nwcsunits);
	im.tmp.wcsunitsPanZoom = nwcsunits;
	pos1 = JS9.PanZoom.getPos(im, "x");
	pos2 = JS9.PanZoom.getPos(im, "y");
	pel = $(target).parent();
	pel.find("[name='pos1']").val(pos1);
	pel.find("[name='pos2']").val(pos2);
	if( im.getWCSSys() !== (im.tmp.wcssysPanZoom||owcssys) ){
	    JS9.PanZoom.xsetwcssys(did, id, {value: im.getWCSSys()});
	}
	im.setWCSSys(owcssys);
	im.setWCSUnits(owcsunits);
    }
}

// get position string based on wcssys
JS9.PanZoom.getPos = function(im, which){
    let s, res, ppos;
    const panobj = im.getPan();
    const ipos = {x: panobj.x, y: panobj.y};
    const owcssys = im.getWCSSys();
    const owcsunits = im.getWCSUnits();
    const wcssys = im.tmp.wcssysPanZoom || owcssys;
    const wcsunits = im.tmp.wcsunitsPanZoom || owcsunits;
    if( owcssys !== wcssys ){
	im.setWCSSys(wcssys);
    }
    if( owcsunits !== wcsunits ){
	im.setWCSUnits(wcsunits);
    }
    switch(wcssys){
    case "image":
	res = String(ipos[which]);
	break;
    case "physical":
	ppos =  im.imageToLogicalPos(ipos);
	res = String(ppos[which]);
	break;
    default:
	if( im.raw.wcs && im.raw.wcs > 0 ){
	    s = JS9.pix2wcs(im.raw.wcs, ipos.x, ipos.y).trim().split(/\s+/);
	    res = which === "x" ? s[0] : s[1];
	} else {
	    res = String(ipos[which]);
	}
	break;
    }
    if( owcssys !== wcssys ){
	im.setWCSSys(owcssys);
    }
    if( owcsunits !== wcsunits ){
	im.setWCSUnits(owcsunits);
    }
    return res;
};

// re-init (avoiding recursion)
JS9.PanZoom.reinit = function(){
    if( !this.inProcess ){
	this.inProcess = true;
	JS9.PanZoom.init.call(this);
	this.inProcess = false;
    }
};

// re-init when a different image is displayed
JS9.PanZoom.display = function(){
    if( this.lastimage !== this.display.image ){
	this.inProcess = true;
	JS9.PanZoom.init.call(this);
	this.inProcess = false;
    }
};

// clear when an image closes
JS9.PanZoom.close = function(){
    // ensure plugin display is reset
    JS9.PanZoom.init.call(this, {mode: "clear"});
};

// constructor: add HTML elements to the plugin
JS9.PanZoom.init = function(opts){
    let s, t, im, mopts, imid, dispid;
    const getPans = () => {
	let res = "<option selected disabled>Pan</option>";
	res += `<option>center</option>`;
	return res;
    };
    const getZooms = () => {
	let i, zoom, name;
	let res = "<option selected disabled>Zoom</option>";
	res += `<option>in</option>`;
	res += `<option>out</option>`;
	res += `<option>to fit</option>`;
	res += `<option disabled>─────</option>`;
	for(i=JS9.imageOpts.zooms; i>0; i--){
	    zoom = Math.pow(2,i);
	    name = `zoom 1/${zoom}`;
	    res += `<option>${name}</option>`;
	}
	for(i=0; i<=JS9.imageOpts.zooms; i++){
	    zoom = Math.pow(2,i);
	    name = `zoom ${zoom}`;
	    res += `<option>${name}</option>`;
	}
	return res;
    };
    const getFlips = () => {
	let res = "<option selected disabled>Flip</option>";
	res += `<option>around x axis</option>`;
	res += `<option>around y axis</option>`;
	return res;
    };
    const getRotates = () => {
	let res = "<option selected disabled>Rotate</option>";
	res += `<option>90 left</option>`;
	res += `<option>90 right</option>`;
	return res;
    };
    const getPos = (im, which) => {
	return JS9.PanZoom.getPos(im, which);
    };
    const getWCSSys = (im) => {
	let i;
	let res = "<option selected disabled>WCS Systems:</option>";
	const wcssys = im.tmp.wcssysPanZoom || im.getWCSSys();
	for(i=0; i<JS9.wcssyss.length; i++){
	    if( wcssys === JS9.wcssyss[i] ){
		res += `<option selected>${JS9.wcssyss[i]}</option>`;
	    } else {
		res += `<option>${JS9.wcssyss[i]}</option>`;
	    }
	}
	return res;
    };
    const getWCSUnits = (im) => {
	let i;
	let res = "<option selected disabled>WCS Units:</option>";
	const wcsunits = im.tmp.wcsunitsPanZoom || im.getWCSUnits();
	const units = ["degrees", "sexagesimal", "pixels"];
	for(i=0; i<units.length; i++){
	    if( wcsunits === units[i] ){
		res += `<option selected>${units[i]}</option>`;
	    } else {
		res += `<option>${units[i]}</option>`;
	    }
	}
	return res;
    };
    // on entry, these elements have already been defined:
    // this.div:      the DOM element representing the div for this plugin
    // this.divjq:    the jquery object representing the div for this plugin
    // this.id:       the id ofthe div (or the plugin name as a default)
    // this.display:  the display object associated with this plugin
    // this.dispMode: display mode (for internal use)
    //
    // opts is optional
    opts = opts || {};
    // set width and height of plugin itself
    this.width = this.divjq.attr("data-width");
    if( !this.width  ){
	this.width  = JS9.PanZoom.WIDTH;
    }
    this.divjq.css("width", this.width);
    this.width = parseInt(this.divjq.css("width"), 10);
    this.height = this.divjq.attr("data-height");
    if( !this.height ){
	this.height  = JS9.PanZoom.HEIGHT;
    }
    this.divjq.css("height", this.height);
    this.height = parseInt(this.divjq.css("height"), 10);
    // clear out html
    this.divjq.html("");
    this.lastTextWidth = 0;
    // set up new html
    this.panzoomContainer = $("<div>")
	.addClass(`${JS9.PanZoom.BASE}Container`)
	.attr("id", `${this.id}Container`)
        .attr("width", this.width)
        .attr("height", this.height)
	.appendTo(this.divjq);
    // do we have an image?
    im = this.display.image;
    if( im && (opts.mode !== "clear") ){
	// convenience variables
	imid = im.id;
	dispid = im.display.id;
	mopts = [];
	mopts.push({name: "header", value: JS9.PanZoom.headerHTML});
	t = sprintf(JS9.PanZoom.panHTML, dispid, imid, getPans());
	mopts.push({name: "pan", value: t});
	t = sprintf(JS9.PanZoom.zoomHTML, dispid, imid, getZooms());
	mopts.push({name: "zoom", value: t});
	t = sprintf(JS9.PanZoom.flipHTML, dispid, imid, getFlips());
	mopts.push({name: "flip", value: t});
	t = sprintf(JS9.PanZoom.rotateHTML, dispid, imid, getRotates());
	mopts.push({name: "rotate", value: t});
	t = sprintf(JS9.PanZoom.pantoHTML, dispid, imid);
	mopts.push({name: "panto", value: t});
	t = sprintf(JS9.PanZoom.pos1HTML, getPos(im, "x"));
	mopts.push({name: "pos1", value: t});
	t = sprintf(JS9.PanZoom.pos2HTML, getPos(im, "y"));
	mopts.push({name: "pos2", value: t});
	t = sprintf(JS9.PanZoom.wcssysHTML, dispid, imid, getWCSSys(im));
	mopts.push({name: "wcssys", value: t});

	t = sprintf(JS9.PanZoom.wcsunitsHTML, dispid, imid, getWCSUnits(im));
	mopts.push({name: "wcsunits", value: t});
	s = im.expandMacro(JS9.PanZoom.panzoomHTML, mopts);
	this.lastimage = im;
    } else {
	s = "<p><center>Pan/Zoom parameters will appear here.</center>";
    }
    this.panzoomContainer.html(s);
};

// add this plugin into JS9
JS9.RegisterPlugin(JS9.PanZoom.CLASS, JS9.PanZoom.NAME,
		   JS9.PanZoom.init,
		   {menu: "zoom",
		    menuItem: "Pan/Zoom Controls ...",
		    onplugindisplay: JS9.PanZoom.init,
		    onsetpan: JS9.PanZoom.reinit,
		    onsetzoom: JS9.PanZoom.reinit,
		    onsetwcssys: JS9.PanZoom.reinit,
		    onsetwcsunits: JS9.PanZoom.reinit,
		    onimagedisplay: JS9.PanZoom.display,
		    onimageclose: JS9.PanZoom.close,
		    help: "help/panzoom.html",
		    winTitle: "Pan/Zoom Controls",
		    winDims: [JS9.PanZoom.WIDTH, JS9.PanZoom.HEIGHT]});
