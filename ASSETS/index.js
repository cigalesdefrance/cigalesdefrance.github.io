window.onload = function go() {
	
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
	
	var layer_bdd1 = new ol.layer.Vector();
	var layer_bdd2 = new ol.layer.Vector();
	var layer_bdd3 = new ol.layer.Vector();
	
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
		'© <a href="https://www.cigalesdefrance.fr">Cigales de France</a>',ol.source.OSM.ATTRIBUTION,'</br><a href="https://observation.org"><img class="copyright" src="https://observation.org/static/img/logo/logo-observation-org.svg"></img></a><a href="https://www.gbif.org"><img  class="copyright" src="https://docs.gbif.org/style/logo.svg"></img></a><a href="https://www.inaturalist.org/"><img class="copyright" src="https://static.inaturalist.org/sites/1-logo.svg"></img></a>']}),
		opacity: 1
	});
	
	// Ne fonctionne pas avec OL 7.0.0
	var layer_ortho = new ol.layer.Tile({
		source: new ol.source.GeoportalWMTS({layer: "ORTHOIMAGERY.ORTHOPHOTOS"}),
		/* minResolution: 200, */
		maxResolution: 200,
		opacity: 0.3
	});
	
	// Bloquage de la rotation sur téléphone
	var interactions = ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false});
	
	
	// CARTE
	var map = new ol.Map({
		interactions: interactions,
		target: 'map',
		layers: [
			layer_osm,
			layer_ortho,
			regions,
			departements,
			layer_bdd3,
			layer_bdd2,
			layer_bdd1
		],
		view: new ol.View({
			center: ol.proj.transform([2, 47], 'EPSG:4326', 'EPSG:3857'),
			zoom: 6
		})
	});
	
	// CLICK SUR FEATURES
	var selectClick = new ol.interaction.Select({
        condition: ol.events.click
	});
	map.addInteraction(selectClick);
	
	
	map.on('click', function(evt) {
		var pixel = evt.pixel;
		
		var features = [];
		map.forEachFeatureAtPixel(pixel, function(feature) {
			features.push(feature);
		});
		observation.innerHTML = '<button><a href="' + features[0].get("description") + '" target="_blank">🡲 Visualiser l\'observation</a></button>';
	});
	
	// Création du Layer Switcher
	var lsControl = new ol.control.LayerSwitcher({
		layers : [
			{layer: layer_bdd1,
				config: {
					title: "Inaturalist",
					description: "Données provenant de Inaturalist, une base de données participative dont les identifications s'effectuent de manière communautaire à partir de photographies.",
				}
			},
			{layer: layer_bdd2,
				config: {
					title: "Observation.org",
					description: "Données provenant de Observation.org, une base de données internationale."
				}
			},
			{layer: layer_bdd3,
				config: {
					title: "GBIF",
					description: "Données provenant du Global Biodiversity Information Facility, qui a pour but de mettre à disposition toute l'information connue sur la biodiversité (données d'observations ou de collections sur les animaux, plantes, champignons, bactéries et archaea)."
				}
			},
			{layer: regions,
				config: {
					title: "Régions de France",
					description: ""
				}
				},{layer: departements,
				config: {
					title: "Départements de France",
					description: ""
				}
			},
			{layer: layer_osm,
				config: {
					title: "OpenStreetMap",
					description: "Couche OpenStreet Map"
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
		//apiKey: "calcul",
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
	
	var choix = document.getElementById('choix');
	
	choix.onchange = function() {
		//title.innerHTML = this.options[this.selectedIndex].text;
		//sp.innerHTML = this.options[this.selectedIndex].getAttribute('espece');
		var espece = this.options[this.selectedIndex].getAttribute('espece');
		
		// Adresse du CSV
		var url_bdd1 = './BDD/INATURALIST/' + espece + '.kml';
		var url_bdd2 = './BDD/OBSERVATION/' + espece + '.kml';
		var url_bdd3 = './BDD/GBIF/' + espece + '.kml';
		
		layer_bdd1.setSource(
			new ol.source.Vector({
				format: new ol.format.KML({
					extractStyles: true,
					extractAttributes: true
				}),
				url: url_bdd1
			})
		);
		
		
		// CLUSTER
		/* layer_bdd1.setSource(
			new ol.source.Cluster({
			distance: 10,
			source : new ol.source.Vector({
			format: new ol.format.KML({
			extractStyles: true,
			extractAttributes: true
			}),
			url: url_bdd1
			})
			}));
		*/
		
		layer_bdd2.setSource(
			new ol.source.Vector({
				format: new ol.format.KML({
					extractStyles: true,
					extractAttributes: true
				}),
				url: url_bdd2
			})
		);
		
		layer_bdd3.setSource(
			new ol.source.Vector({
				format: new ol.format.KML({
					extractStyles: true,
					extractAttributes: true
				}),
				url: url_bdd3
			})
		);
		
	};
	choix.onchange();
}
