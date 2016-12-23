/*
 * Copyright (c) 2015-2017 PointSource, LLC.
 * MIT Licensed
 */
		function init() {
			// initialize marker overlay to false
			vm.showOverlay = false;
			// disable angular-snap so users can drag map w/o triggering page slider
			snapRemote.disable();
		}

		vm.map = {
			center: {
				latitude: 45, longitude: -73
			},
			zoom: 8
		};

		vm.markerModels = [
			{
				coords: {
					latitude: '35.869915',
					longitude: '-78.641271'
				},
				locationID: '314159',
				iconURL: 'http://googlemaps.googlermania.com/google_maps_api_v3/en/Google_Maps_Marker.png',
				name: 'Test'
			},
			{
				coords: {
					latitude: '35.769915',
					longitude: '-78.641271'
				},
				locationID: '314158',
				iconURL: 'http://googlemaps.googlermania.com/google_maps_api_v3/en/Google_Maps_Marker.png',
				name: 'Test 2'
			},
			{
				coords: {
					latitude: '35.669915',
					longitude: '-78.441271'
				},
				locationID: '314157',
				iconURL: 'http://googlemaps.googlermania.com/google_maps_api_v3/en/Google_Maps_Marker.png',
				name: 'Test 3'
			},
			{
				coords: {
					latitude: '35.569915',
					longitude: '-78.341271'
				},
				locationID: '314156',
				iconURL: 'http://googlemaps.googlermania.com/google_maps_api_v3/en/Google_Maps_Marker.png',
				name: 'Test 4'
			},
			{
				coords: {
					latitude: '35.469915',
					longitude: '-78.241271'
				},
				locationID: '314155',
				iconURL: 'http://googlemaps.googlermania.com/google_maps_api_v3/en/Google_Maps_Marker.png',
				name: 'Test 5'
			}
		];

		// when clicked, show an overlay of data about this location
		// create an overlay to display information
		vm.markers = {
			models: vm.markerModels,
			idKey: 'locationID',
			coords: 'coords',
			click: function (data) {
				vm.selectedMarker = data.model;
				vm.showOverlay = true;
			},
			fit: true,
			icon: 'iconURL'
		};

		init();
