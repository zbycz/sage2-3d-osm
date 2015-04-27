// SAGE2 is available for use under the SAGE2 Software License
//
// University of Illinois at Chicago's Electronic Visualization Laboratory (EVL)
// and University of Hawai'i at Manoa's Laboratory for Advanced Visualization and
// Applications (LAVA)
//
// See full text, terms and conditions in the LICENSE.txt included file
//
// Copyright (c) 2014


function addCSS(url, callback) {
	var fileref = document.createElement("link");

	if (callback) fileref.onload = callback;

	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", url);
	document.head.appendChild(fileref);
}

var osm3d = SAGE2_App.extend({
	construct: function () {
		arguments.callee.superClass.construct.call(this);

		this.resizeEvents = "continuous"; //"onfinish";

		// Need to set this to true in order to tell SAGE2 that you will be needing widget controls for this app
		this.enableControls = true;

		// for SAGE2 interaction
		this.lastZoom = null;
		this.dragging = null;
		this.position = null;

		this.map = null;
		this.layer1 = null;


		this.g = null;

		this.allLoaded = 0;
	},

	init: function (id, width, height, resrc, date) {

		// call super-class 'init'
		arguments.callee.superClass.init.call(this, id, "div", width, height, resrc, date);

		var map_start_location = {
			'London': [51.508, -0.105, 15],
			'New York': [40.70531887544228, -74.00976419448853, 15],
			'Seattle': [47.609722, -122.333056, 15]
		}['New York'];


		console.log(map_start_location);

		// Get width height from the supporting div		
		var width = this.element.clientWidth;
		var height = this.element.clientHeight;

		this.element.id = "div" + id;

		// for SAGE2
		this.lastZoom = date;
		this.dragging = false;
		this.position = {x: 0, y: 0};

		// Load the CSS file for leaflet.js
		var that = this;
		addCSS(this.resrcPath + "lib/leaflet/leaflet.css", function () {

			that.layer1 = Tangram.leafletLayer({
				scene: that.resrcPath + 'styles.yaml',
				attribution: '&copy; OpenStreetMap | webgl by <a href="https://github.com/tangrams/tangram" target="_blank">Mapbox Tangrams</a>'
			});

			//that.layer1 = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
			//	maxZoom: 18
			//});

			that.map = L.map(that.element.id, {
				layers: [that.layer1],
				zoomControl: false
			});

			that.map.setView(map_start_location.slice(0, 2), map_start_location[2]);

		});
	},


	zoomIn: function () {
		var z = this.map.getZoom();
		this.map.setZoom(z + 1, {animate: false});
		this.lastZoom = date;

		var z2 = this.map.getZoom();
	},

	zoomOut: function () {
		var z = this.map.getZoom();
		this.map.setZoom(z - 1, {animate: false});
		this.lastZoom = date;

		var z2 = this.map.getZoom();
	},


	load: function (state, date) {
		// create the widgets
		console.log("creating controls");
		this.controls.addButton({
			type: "next", sequenceNo: 4, action: function (date) {
				//This is executed after the button click animation occurs.
				this.changeMap();
			}.bind(this)
		});


		this.controls.addButton({
			type: "fastforward", sequenceNo: 6, action: function (date) {
				this.zoomIn();
			}.bind(this)
		});

		this.controls.addButton({
			type: "rewind", sequenceNo: 7, action: function (date) {
				//This is executed after the button click animation occurs.
				this.zoomOut();
			}.bind(this)
		});


		this.controls.finishedAddingControls(); // Important
	},

	draw: function (date) {
	},

	resize: function (date) {
		this.map.invalidateSize();
		this.refresh(date);
	},

	event: function (eventType, pos, user, data, date) {

		if (eventType === "pointerPress" && (data.button === "left")) {
			this.dragging = true;
			this.position.x = pos.x;
			this.position.y = pos.y;
		}
		if (eventType === "pointerMove" && this.dragging) {
			// need to turn animation off here or the pan stutters
			this.map.panBy([this.position.x - pos.x, this.position.y - pos.y], {animate: false});
			this.position.x = pos.x;
			this.position.y = pos.y;
		}
		if (eventType === "pointerRelease" && (data.button === "left")) {
			this.dragging = false;
			this.position.x = pos.x;
			this.position.y = pos.y;
		}

		// Scroll events for zoom
		if (eventType === "pointerScroll") {
			var amount = data.wheelDelta;
			var diff = date - this.lastZoom;

			console.log(data);

			if (amount >= 3 && (diff > 300)) {
				// zoom in
				this.zoomIn();

				//this.log("scroll: " + amount + ", diff: " + diff + ", zoom: " + z + "(" + z2 + ")");
			}
			else if (amount <= -3 && (diff > 300)) {
				// zoom out
				this.zoomOut();


				//this.log("scroll: " + amount + ", diff: " + diff + ", zoom: " + z + "(" + z2 + ")");
			}
		}

		this.refresh(date);
	}

});