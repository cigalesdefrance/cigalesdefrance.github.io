window.onload = function go() {
	
	var choix = document.getElementById('choix');
	var sp = document.getElementById('sp');
	
	choix.onchange = function() {
		title.innerHTML = this.options[this.selectedIndex].text;
		sp.innerHTML = this.options[this.selectedIndex].getAttribute('espece');
		var espece = this.options[this.selectedIndex].getAttribute('espece');
		
		// Adresse du CSV
		var url_bdd1 = './BDD/INATURALIST/' + espece + '.kml';
		var url_bdd2 = './BDD/OBSERVATION/' + espece + '.kml';
		
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
		/* var layer_bdd1 = new ol.layer.Vector({
			source: new ol.source.Vector({
			format: new ol.format.GeoJSON()
			}),
			style: style_bdd1
			
		}); */
		
		var layer_bdd1 = new ol.layer.Vector({
			source : new ol.source.Vector({
				format : new ol.format.KML(),
				url : url_bdd1
			}),
			style: style_bdd1
		});
		
		/* var layer_bdd2 = new ol.layer.Vector({
			source: new ol.source.Vector({
			format: new ol.format.GeoJSON()
			}),
			style: style_bdd2
			
		}); */
		
		var layer_bdd2 = new ol.layer.Vector({
			source : new ol.source.Vector({
				format : new ol.format.KML(),
				url : url_bdd2
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