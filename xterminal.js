/*

	XTerminal
	It's full of 1978s goodness.

*/

var xt = new Object({

	preferences: {
		
		debug: true,
		speed: 9,
		blink: {
			interval: 800
		},
		prompt: {
			max_length: 15
		}
	
	},
	
	ready: false,
	printing: false,
	current_char: 0,
	length: 0,
	max_width: 46,
	hide_blinker: false,
	blinker_interval: 0,
	waiting_for_any_key: false,
	in_prompt: false,
	prompt_response: "",
	prompt_callback: "",
	
	init: function(callback) {
	
		if (typeof jQuery === "undefined" || typeof $ === "undefined") {
			console.log("No jQuery found, quitting.");
			return;
		}
		
		$(document).ready(function() {
		
			if ($("#console").length === 0) {
				// Append required HTML.
				$("body").append("<div id=\"screen\" class=\"noselect\">" +
									"<div id=\"console\" class=\"noselect\">" +
									"<div id=\"blinker\" class=\"noselect\">&#9608;</div>" +
									"</div>" +
									"<div id=\"overlay\" class=\"noselect\">&nbsp;</div>" +
								 "</div>");
			}
			
			$(document).keydown(function(event) {
				xt.dispatch_key(event);
			});
		
			xt.ready = true;
			xt.blinker_init();
			callback();
		
		});
		
	
	},
	
	dispatch_key: function(e) {
	
		if (this.ready === false || this.printing === true) {
			return;
		}
		
		if (xt.waiting_for_any_key === true) { 
			xt.waiting_for_any_key = false;
			return;
		}
		
		if (xt.in_prompt === true) {
			xt.process_prompt_key(e);
			return;
		}
	
	},
	
	process_prompt_key: function(e) {
	
		e.preventDefault();
		var m_key = e.which;
		
		if (m_key === 13 || xt.prompt_response.length >= xt.preferences.prompt.max_length) {
			xt.dispatch_input();
			return;
		}
		
		if (m_key >= 32 && m_key <= 125) { 
			xt.prompt_response = xt.prompt_response + String.fromCharCode(m_key).toUpperCase();
			$("#console").append(String.fromCharCode(m_key).toUpperCase());
			xt.blinker_insert();
		} else {
			if (m_key === 8 && xt.prompt_response.length >= 1) {
				xt.prompt_response = xt.prompt_response.slice(0,-1);
				$("#console > #blinker").remove();
				$("#console").html($("#console").html().slice(0,-1));
				xt.blinker_insert();
			}
		}
		
	},
	
	dispatch_input: function() {
		
		xt.in_prompt = false;
		$("#console").append("<br>");
		
		if (typeof xt.prompt_callback === "function") {
			xt.prompt_callback(xt.prompt_response);
		} else {
			console.log("No callback specified for prompt, quitting.")
		}
	
	},
	
	blinker_insert: function() {
		$("#console > #blinker").remove();
		if (xt.hide_blinker === true) { return; }
		$("#console").append('<div id="blinker" class="noselect">&#9608;</div>');
	},
	
	blinker_init: function() {
		blinker_interval = setInterval(xt.blinker, xt.preferences.blink.interval);
	},
	
	blinker: function() {
	
		if (xt.hide_blinker === true) {
			$("#blinker").css("display","none"); return;
		}
		if ($("#blinker").css("display") === "none") {
			$("#blinker").css("display","inline-block");
		} else {
			$("#blinker").css("display","none");
		}	
	
	},
	
	write: function(text) { xt.p(text); },
	
	p: function(text, no_new_line) {
	
		if (this.ready === false || this.printing === true) {
			setTimeout(function() { xt.p(text); }, 10);
			return;
		}
		
		text = this.entity_replace(text);
		
		$("#blinker").remove();
		this.printing = true;
		this.current_char = 0;
		this.add_char(text, 0, no_new_line);
		this.length = this.length + text.length;
	
	},
	
	prompt: function(text, callback) { xt.pr(text, callback); },
	
	pr: function(text, callback) {
	
		if (this.ready === false || this.printing === true) {
			setTimeout(function() { xt.pr(text, callback); }, 200);
			return;
		}
		
		if (text === "" || typeof text === "undefined") {
			xt.p(">", true);
		} else {
			xt.p(text, true);
		}
		
		setTimeout(function() {
			xt.prompt_callback = callback;
			xt.prompt_response = "";
			xt.in_prompt = true;
		}, 64);
	
	},
	
	entity_replace: function(text) {
	
		text = xt.replace_all(text, "&copy;","\u00A9");
		//text = xt.replace_all(text, "\t","\xa0\xa0\xa0");
		return text;
	
	},
	
	replace_all: function(str, f, r) {
		return str.replace(new RegExp(f, 'g'), r);
	},
	
	fill: function(w_char) { xt.f(w_char); },
	
	f: function(w_char) {
	
		if (w_char.length > 1) { 
			console.log("f only takes one character.");
			return; 
		}
		
		this.c();
		for (var i=0;i<45*40;i++) {
			$("#console").append(w_char);
			if (i%46 === 0 && i !== 0) {
				$("#console").append("<br>");
			}
		}
		
		document.title = $("#console")[0].clientWidth / 14;
	
	},
	
	clean: function() { this.c(); },
	clear: function() { this.c(); },
	
	c: function() {
	
		this.length = 0;
		$("#console").html("");
	
	},
	
	center: function(text) { this.ct(text); },
	
	ct: function(text) {
		
		text = this.entity_replace(text);
		var padding_length = Math.round((this.max_width / 2) - (text.length / 2));
		for (var i=1;i<=padding_length;i++) {
			text = "\xa0" + text;
		}
		
		this.p(text);
	
	},
	
	new_line: function(count) { this.nl(count) },
	
	nl: function(count) {
	
		if (typeof count !== undefined && isNaN(count) === false) {
			for (var i=0;i<count;i++) {
				$("#console").append("<br>");
			}
		} else {
			$("#console").append("<br>");
		}
	
	},
	
	hide_blinker: function() { this.hb(); },
	hb: function() { 
		xt.hide_blinker = true; 
		clearInterval(xt.blinker_interval);
		$("#blinker").css("display","none");
	},
	
	show_blinker: function() { this.sb(); },
	sb: function() { 
		xt.hide_blinker = false; 
		xt.blinker_init();
	},
	
	wait: function(callback) { this.w(callback); },
	w: function(callback) {
	
		xt.waiting_for_any_key = true;
		xt.waiting_for_any_key_loop(callback);
	
	},
	
	waiting_for_any_key_loop: function(callback) {
	
		if (xt.waiting_for_any_key === false) {
			callback();
		} else {
			setTimeout(function() { xt.waiting_for_any_key_loop(callback) }, 100);
		}
	
	},
	
	add_char: function(text, charnum, no_new_line) {
	
		if (charnum >= text.length) {
			setTimeout(function() {
				xt.printing = false;
				xt.blinker_insert();
				if (no_new_line !== true) {
					$("#console").append('<br/>');
				}
			}, xt.preferences.speed * 2);
			return;
		}
		
		var m_char = text.substring(charnum, charnum + 1);
		var to_print = m_char;
		
		if (m_char === "\n") { to_print = "<br>"; }
		if (m_char === "\t") { to_print = "&nbsp;&nbsp;&nbsp;"; }
		
		$("#console").append(to_print);
		$("#console").scrollTop(xt.length * 120);
		
		charnum++;
		setTimeout(function() {
			xt.add_char(text, charnum, no_new_line);
		}, xt.preferences.speed);
	
	}

});