window.onload = function go() {
	
	var choix = document.getElementById('choix');
	var sp = document.getElementById('sp');
	
	choix.onchange = function() {
		title.innerHTML = this.options[this.selectedIndex].text;
		sp.innerHTML = this.options[this.selectedIndex].getAttribute('espece');
		var espece = this.options[this.selectedIndex].getAttribute('espece');
		
		
		// Adresse du CSV
		var url_bdd1 = './BDD/INATURALIST/' + espece + '.csv';
		var url_bdd2 = './BDD/OBSERVATION/' + espece + '.csv';
		
		// style des couches
		var style_bdd1 = new ol.style.Style({
			image: new ol.style.Circle({
				radius: 5, //taille du rond
				fill: new ol.style.Fill({color: 'red'}), //remplissage
				stroke: new ol.style.Stroke({
					color: "black", width: 1 //contour et taille du contour
				})
			})
		})
		
		var style_bdd2 = new ol.style.Style({
			image: new ol.style.Circle({
				radius: 5, //taille du rond
				fill: new ol.style.Fill({color: 'blue'}), //remplissage
				stroke: new ol.style.Stroke({
					color: "black", width: 1 //contour et taille du contour
				})
			})
		})
		
		var style_regions = new ol.style.Style({
			/* fill: new ol.style.Fill({color: 'blue'}), //remplissage */
			stroke: new ol.style.Stroke({
				color: "black", width: 1 //contour et taille du contour
			})
		})
		
		var style_departements = new ol.style.Style({
			/* fill: new ol.style.Fill({color: 'blue'}), //remplissage */
			stroke: new ol.style.Stroke({
				color: "black", lineDash: [4], width: 1 //contour et taille du contour
			})
		})
		
		// Initialize an empty vector layer with a vector source and a GeoJSON format
		var layer_bdd1 = new ol.layer.Vector({
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON()
			}),
			style: style_bdd1
			
		});
		
		var layer_bdd2 = new ol.layer.Vector({
			source: new ol.source.Vector({
				format: new ol.format.GeoJSON()
			}),
			style: style_bdd2
			
		});
		
		// Fonds de carte de base
		var regions = new ol.layer.Vector({
			source: new ol.source.Vector({
				url: 'ASSETS/regions.geojson',
				format: new ol.format.GeoJSON()
			}),
			minResolution: 200,
			style: style_regions
		});
		
		var departements = new ol.layer.Vector({
			source: new ol.source.Vector({
				url: 'ASSETS/departements.geojson',
				format: new ol.format.GeoJSON()
			}),
			minResolution: 20,
			maxResolution: 200,
			style: style_departements
		});
		
		
		var layer_osm = new ol.layer.Tile({
			source: new ol.source.OSM({attributions: [
			'© <a href="https://www.cigalesdefrance.fr">Cigales de France</a>',ol.source.OSM.ATTRIBUTION	]}),
			opacity: 1
		});
		
		// Ne fonctionne pas avec OL 7.0.0
		var layer_ortho = new ol.layer.Tile({
			source: new ol.source.GeoportalWMTS({layer: "ORTHOIMAGERY.ORTHOPHOTOS"}),
			/* minResolution: 200, */
			maxResolution: 200,
			opacity: 0.3
		});
		
		
		// Declare the map with a tile layer, the empty vector layer and set it center
		var map = new ol.Map({
			target: 'map',
			layers: [
				layer_osm,
				layer_ortho,
				regions,
				departements,
				layer_bdd2,
				layer_bdd1
			],
			target: 'map',
			view: new ol.View({
				center: ol.proj.transform([2, 47], 'EPSG:4326', 'EPSG:3857'),
				zoom: 6
			})
		});
		
		// Initialize a XMLHttpRequest object to prepare for Ajax request
		// (we do not try to catch error)
		var http_bdd1 = new XMLHttpRequest();
		var http_bdd2 = new XMLHttpRequest();
		
		// Assign function to manage when data will be loaded via Ajax
		http_bdd1.onreadystatechange = function(data) {
			// If request not complete
			if (http_bdd1.readyState != 4 || http_bdd1.status != 200) {
				return;
				} else {
				// Response from TSV will be reused to provide to the library
				// https://github.com/mapbox/csv2geojson the required content
				// to transform it to GeoJSON
				csv2geojson.csv2geojson(http_bdd1.responseText, {
					latfield: 'Latitude',
					lonfield: 'Longitude',
					delimiter: ';'
					}, function(err, data) {
					// After data reception, add features to the empty vector layer
					var geoJsonFormat = new ol.format.GeoJSON();
					var features = geoJsonFormat.readFeatures(
						data, {
							featureProjection: 'EPSG:3857'
						}
					);
					layer_bdd1.getSource().addFeatures(features);
				});
			}
		};
		
		http_bdd2.onreadystatechange = function(data) {
			// If request not complete
			if (http_bdd2.readyState != 4 || http_bdd2.status != 200) {
				return;
				} else {
				// Response from TSV will be reused to provide to the library
				// https://github.com/mapbox/csv2geojson the required content
				// to transform it to GeoJSON
				csv2geojson.csv2geojson(http_bdd2.responseText, {
					latfield: 'Latitude',
					lonfield: 'Longitude',
					delimiter: ';'
					}, function(err, data) {
					// After data reception, add features to the empty vector layer
					var geoJsonFormat = new ol.format.GeoJSON();
					var features = geoJsonFormat.readFeatures(
						data, {
							featureProjection: 'EPSG:3857'
						}
					);
					layer_bdd2.getSource().addFeatures(features);
				});
			}
		};
		
		// Set the url for the Ajax call
		http_bdd1.open('GET', url_bdd1);
		http_bdd2.open('GET', url_bdd2);
		// Make the ajax call. It will fire previous onreadystatechange 
		// after data reception from the file
		http_bdd1.send();
		http_bdd2.send();
		
		// Création du Layer Switcher
		var lsControl = new ol.control.LayerSwitcher({
			// paramétrage de l'affichage de la couche OSM
			layers : [
				{layer: layer_bdd1,
					config: {
						title: "BDD1",
						description: "",
						/* quicklookUrl: "https://" */
					}
				},
				{layer: layer_bdd2,
					config: {
						title: "BDD2",
						description: ""
						/* quicklookUrl: "https://" */
					}
				},
				{layer: layer_osm,
					config: {
						title: "OpenStreetMap",
						description: "Couche OpenStreet Map",
						quicklookUrl: "https://openstreetmap.org"
					}
				}
			]
		});
		
		// Ajout du LayerSwitcher à la carte
		map.addControl(lsControl);
		
		// Création du contrôle de mesure de distance
		/* var length = new ol.control.MeasureLength({});
		map.addControl(length); */
		
		// Création du contrôle de détermination des coordonnées + altitude
		var mpControl = new ol.control.GeoportalMousePosition({
			apiKey: "calcul",
			collapsed: true,
			editCoordinates : true,
			altitude : {
				triggerDelay : 500
			} 
		});
		map.addControl(mpControl);
		
		// Recherche de lieu
		var searchControl = new ol.control.SearchEngine({});
		map.addControl(searchControl);
		
		// Attribution automatique
		var attControl = new ol.control.GeoportalAttribution({collapsed: false});
		map.addControl(attControl);
		
	};
	choix.onchange();
	
}