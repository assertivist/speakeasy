/** for below code only:
 * Copyright (c) Mozilla Foundation http://www.mozilla.org/
 * This code is available under the terms of the MIT License
 */
if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
	'use strict';
    var len = this.length;
    if (typeof fun !== "function"){
      throw new TypeError();
	}
    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
		if (i in this){
			res[i] = fun.call(thisp, this[i], i, this);
		}
    }
    return res;
  };
}

/* for below code only:
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/	
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};



/* code below (c) dopetank software http://dopetank.net */
function debug(msg){
	if(!debug_mode){
		return;
	}
	console.log(msg);
}

function lerp(a, b, u){
	return (1 - u) * a + u * b;
}

function lerp3(startarr, endarr, u){
	var r1 = lerp(startarr[0], endarr[0], u);
	var r2 = lerp(startarr[1], endarr[1], u);
	var r3 = lerp(startarr[2], endarr[2], u);
	return [r1, r2, r3];
}

function rgb_to_hsv(colorarr){
	var r = colorarr[0];
	var g = colorarr[1];
	var b = colorarr[2];
	var maxc = Math.max(r,g,b);
	var minc = Math.min(r,g,b);
	var v = maxc;
	if(minc == maxc) return [0,0,v];
	var diff = maxc - minc;
	var s = diff / maxc;
	var rc = (maxc - r) / diff;
	var gc = (maxc - g) / diff;
	var bc = (maxc - b) /diff;
	var h = 0;
	if(r == maxc) h = bc - gc;
	else if(g == maxc) h = 2.0 + rc - bc;
	else h = 4.0 + gc - rc;
	h = (h / 6.0) % 1.0;
	return [h, s, v];
}

function hsv_to_rgb(colorarr){
	var h = colorarr[0];
	var s = colorarr[1];
	var v = colorarr[2];
	if(s == 0.0) return [v,v,v];
	var i = parseInt(Math.floor(h * 6.0), 10);
	var f = (h * 6.0) - i;
	var p = v * (1.0 - s);
	var q = v * (1.0 - s * f);
	var t = v * (1.0 - s * (1.0 - f));
	if(i % 6 == 0) return [v, t, p];
	switch(i){
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
}

// depeche mode voice:
//      YOUR OWN....
//      PERSONAL....
//		JQUESUS.....

function ele(id) { 
	var o = document.getElementById(id);
	if(!o) return o;
	o.show = function(){ o.style.display = "block";};
	o.hide = function(){ o.style.display = "none"; };
	o.find = function(selector){ 
		if(o.getElementsByClassName) 
			return Array.prototype.slice.call(o.getElementsByClassName(selector), 0); 
		else 
			return Array.prototype.slice.call(document.getElementsByClassName(selector), 0);
	};
	o.removeClass = function(cls){ 
		o.className = (o.getAttribute("class").split(/\s+/).map(function(x){ 
			if(x !== cls){ return x; } 
			else{ return ""; } 
		})).join(" "); 
	};
	o.addClass = function(cls){ o.className = o.className+" "+cls; };
	o.hilite = function(){ o.style.backgroundColor = "#FF9C9C"; };
	o.add = function(elearray){ 
		elearray.forEach(function(ele){
			o.appendChild(ele);
		}); 
		return o;
	};
	o.fadeColorTo = function(property, from_color, to_color, duration){
		o.fadeColorTo(property, from_color, to_color, duration, function(){});
	}
	o.fadeColorTo = function(property, from_color, to_color, duration, callback){
		var intv = 10;
		var steps = duration/intv;
		var step_u = 1.0/steps;
		var u = 0.0;
		from_color = rgb_to_hsv(from_color);
		to_color = rgb_to_hsv(to_color);
		var animInt = setInterval(function(){
			if(u >= 1.0) {
				clearInterval(animInt);
				return callback();
			}  
			var c = hsv_to_rgb(lerp3(from_color, to_color, u));
			var colorname = 'rgb('+Math.floor(c[0])
							  +','+Math.floor(c[1])
							  +','+Math.floor(c[2])+')';
			o.style.setProperty(property, colorname);
			u += step_u;
		}, intv);
	}
	return o;
}


var illegalchars = ["~","^:","<",">","\\"];

function sescape(message){
	for(var i = 0; i < illegalchars.length; i++){
		message.replace(illegalchars[i],"");
	}
	return message;
}

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}