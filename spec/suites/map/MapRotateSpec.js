describe("Map.Rotate", function () {
	var container,
	    map;

	// Container size and view match https://github.com/ronikar/Leaflet/issues/3
	var WIDTH = '800px',
	    HEIGHT = '600px',
	    CENTER = [51.505, -0.09],
	    ZOOM = 13;

	var points = [
		L.point(0, 0),
		L.point(100, 100),
		L.point(700, 90),
		L.point(400, 300),
		L.point(50, 550),
		L.point(800, 600)
	];

	// Only float noise is tolerated; the bug this guards against was ~0.56px.
	var EPSILON = 1e-6;

	function maxRoundTripError(m) {
		var max = 0;

		for (var i = 0; i < points.length; i++) {
			var back = m.latLngToContainerPoint(m.containerPointToLatLng(points[i]));
			max = Math.max(max, points[i].distanceTo(back));
		}

		return max;
	}

	afterEach(function () {
		removeMapContainer(map, container);
		map = container = null;
	});

	describe("with rotation enabled", function () {
		beforeEach(function () {
			container = createContainer(WIDTH, HEIGHT);
			map = L.map(container, {rotate: true});
			map.setView(CENTER, ZOOM);
		});

		it("#latLngToContainerPoint inverts #containerPointToLatLng at the default bearing", function () {
			expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
		});

		it.skipIfNo3d("#latLngToContainerPoint inverts #containerPointToLatLng when rotated", function () {
			map.setBearing(45);

			expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
		});

		it.skipIfNo3d("#latLngToContainerPoint inverts #containerPointToLatLng at any bearing", function () {
			for (var bearing = 0; bearing < 360; bearing += 15) {
				map.setBearing(bearing);

				expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
			}
		});

		it.skipIfNo3d("#latLngToContainerPoint inverts #containerPointToLatLng after panning", function () {
			map.setBearing(45);
			map.panBy([137, -61], {animate: false});

			expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
		});

		it.skipIfNo3d("#latLngToContainerPoint inverts #containerPointToLatLng after re-centring", function () {
			map.setBearing(45);
			map.setView([51.51, -0.1], ZOOM, {animate: false});

			expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
		});

		// Floor is 3, not 2: at zoom 2 the rotated viewport spans more than the
		// projected world, so corners clamp at +/-85.0511 deg and the trip is
		// legitimately lossy. Ceiling is 18: the residual is project/unproject
		// float noise, which doubles per zoom level.
		it.skipIfNo3d("#latLngToContainerPoint inverts #containerPointToLatLng at every zoom level", function () {
			map.setBearing(30);

			for (var zoom = 3; zoom <= 18; zoom++) {
				map.setView(CENTER, zoom, {animate: false});

				expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
			}
		});

		// The gap the issue calls out for hit-testing: a renderer resolves the
		// pointer with containerPointToLayerPoint and compares it against vertices
		// placed by latLngToLayerPoint.
		it.skipIfNo3d("#latLngToLayerPoint agrees with #containerPointToLayerPoint when rotated", function () {
			map.setBearing(45);

			for (var i = 0; i < points.length; i++) {
				var pointer = map.containerPointToLayerPoint(points[i]),
				    vertex = map.latLngToLayerPoint(map.containerPointToLatLng(points[i]));

				expect(pointer.distanceTo(vertex)).to.be.lessThan(EPSILON);
			}
		});

		// latLngToContainerPoint is this composition; plugins compose it by hand.
		it.skipIfNo3d("#latLngToContainerPoint is exactly #layerPointToContainerPoint of #latLngToLayerPoint", function () {
			map.setBearing(45);

			var latlng = L.latLng(51.51, -0.1);

			expect(map.latLngToContainerPoint(latlng))
				.to.eql(map.layerPointToContainerPoint(map.latLngToLayerPoint(latlng)));
		});

		// ImageOverlay._reset only reproduces its old sizes while this holds.
		it.skipIfNo3d("keeps the pixel origin on whole pixels when rotated", function () {
			map.setBearing(45);

			var origin = map.getPixelOrigin();

			expect(origin.x).to.equal(Math.round(origin.x));
			expect(origin.y).to.equal(Math.round(origin.y));
		});

		it.skipIfNo3d("sizes an image overlay in whole pixels when rotated", function () {
			map.setBearing(45);

			var blankUrl = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
			    overlay = L.imageOverlay(blankUrl, [[51.5, -0.1], [51.51, -0.08]]).addTo(map),
			    style = overlay.getElement().style;

			expect(style.width).to.equal(Math.round(parseFloat(style.width)) + 'px');
			expect(style.height).to.equal(Math.round(parseFloat(style.height)) + 'px');
		});

		it.skipIfNo3d("#layerPointToContainerPoint inverts #containerPointToLayerPoint when rotated", function () {
			map.setBearing(45);

			for (var i = 0; i < points.length; i++) {
				var back = map.layerPointToContainerPoint(map.containerPointToLayerPoint(points[i]));
				expect(points[i].distanceTo(back)).to.be.lessThan(EPSILON);
			}
		});
	});

	describe("with rotation disabled", function () {
		beforeEach(function () {
			container = createContainer(WIDTH, HEIGHT);
			map = L.map(container);
			map.setView(CENTER, ZOOM);
		});

		it("#latLngToContainerPoint inverts #containerPointToLatLng", function () {
			expect(maxRoundTripError(map)).to.be.lessThan(EPSILON);
		});

		it("#latLngToLayerPoint still snaps to whole pixels", function () {
			var p = map.latLngToLayerPoint([51.51, -0.1]);

			expect(p.x).to.equal(Math.round(p.x));
			expect(p.y).to.equal(Math.round(p.y));
		});
	});
});
