/*

	XTerminal Graf
	"Advanced" graphics for your XTerminal.

*/

xt.graf = {

		current_x: 0,
		current_y: 0,
		
		shifting: false,
		just_changed_xy: false,
		
		vboxes: {
		
			get: function(x, y) {
				return $("#vbox-" + x + "-" + y);
			},
			
			get_line: function(y) {
				return $('[id$="-' + y + '"]');
			}
		
		},
		
		goxy: function(x, y) {
		
			if (xt.ready === false || xt.printing === true) {
				setTimeout(function() { xt.graf.goxy(x, y); }, 300);
				return;
			}
		
			this.just_changed_xy = true;
			this.current_x = x;
			this.current_y = y;
		
		},
		
		invert: function(x, y) {
		
			if (xt.ready === false || xt.printing === true) {
				setTimeout(function() { xt.graf.invert(x, y); }, 300);
				return;
			}
		
			this.vboxes.get(x,y).addClass("inverted");
		
		},
		
		blinker: function() {
		
			if (xt.printing === true) {
				$(".blinker").removeClass("show"); return;
			}
			
			$(".blinker").toggleClass("show");
		
		},
		
		blinker_insert: function() {
		
			if (xt.ready === false || xt.printing === true) {
				setTimeout(function() { xt.graf.putxy(x, y, char); }, 10);
				return;
			}
			
			$(".blinker").removeClass('blinker');
			
			this.vboxes.get(xt.graf.current_x + 1,xt.graf.current_y).html(" ");
			this.vboxes.get(xt.graf.current_x + 1,xt.graf.current_y).addClass("blinker");
		
		},
		
		putxy: function(x, y, char) {
		
			if (xt.ready === false || xt.printing === true) {
				setTimeout(function() { xt.graf.putxy(x, y, char); }, 300);
				return;
			}
		
			this.vboxes.get(x,y).html(char);
		
		},
		
		clear: function() {
			this.current_x = 0;
			this.current_y = 0;
			$(".vbox").html("");
		},
		
		unshift_y: function(c) {
		
			if (isNaN(c) === true) { c = 1; }
			
			this.shifting = true;

			for(var y=0;y<=xt.graf_mode_max_y - 1;y++) {
				for(var x=0;x<xt.graf_mode_max_x;x++) {
					this.vboxes.get(x,y).html(this.vboxes.get(x,y + 1).html());
				}
			}
			
			this.vboxes.get_line(xt.graf_mode_max_y - 1).html(" ");
			this.shifting = false;
		
		},
		
		print: function(text, no_new_line) {
		
			xt.printing = true;
			xt.current_char = 0;
			$(".blinker").removeClass("show");
			
			if (xt.graf.current_y !== 0 && xt.graf.just_changed_xy !== true) {
				xt.graf.next_line();
				xt.graf.current_x = 0;
			}
			
			xt.graf.add_char(text, 0, no_new_line);
			xt.length = xt.length + text.length;
			console.log("X:\t" + this.current_x + "\nY:\t" + this.current_y);
		
		},
		
		nl: function(count) {
		
			if (typeof count !== undefined && isNaN(count) === false) {
				this.current_y = this.current_y + count + 1;
			} else {
				this.next_line();
			}
		
		},
		
		append_char: function(char) {
		
			this.current_x++;
			this.vboxes.get(this.current_x, this.current_y).html(char);
		
		},
		
		delete_last_char: function() {
		
			this.vboxes.get(this.current_x, this.current_y).html("");
			this.current_x = this.current_x - 1;
		
		},
		
		next_line: function() {
		
			xt.graf.current_y++;
			
			if (xt.graf.current_y >= xt.graf_mode_max_y) {
				xt.graf.current_y = xt.graf.current_y - 1;
				xt.graf.unshift_y();
			}
		
		},
		
		add_char: function(text, charnum, no_new_line) {
		
			if (this.shifting) {
				setTimeout(function() { xt.graf.add_char(text, charnum, no_new_line); }, 10);
				return;
			}
			
			if (charnum >= text.length) {
				setTimeout(function() {
					xt.printing = false;
					xt.blinker_insert();
					if (no_new_line !== true) {
						xt.graf.next_line();
						xt.graf.current_x = 0;
					}
				}, xt.preferences.speed * 2);
				return;
			}
		
			var m_char = text.substring(charnum, charnum + 1);
			var to_print = m_char;
		
			if (m_char === "\n") { xt.graf.next_line(); this.current_x = -1; }
			if (m_char === "\t") { this.current_x = this.current_x + 1; }
			
			if (this.just_changed_xy === true) {
				if (charnum === 0) {
					this.just_changed_xy = false;
				}
			}
			
			this.vboxes.get(this.current_x, this.current_y).html(to_print);
		
			charnum++;
			if (charnum < text.length) {
				this.current_x++;
			}
			
			setTimeout(function() {
				xt.graf.add_char(text, charnum, no_new_line);
			}, xt.preferences.speed);
		
		}
	
		
	
};