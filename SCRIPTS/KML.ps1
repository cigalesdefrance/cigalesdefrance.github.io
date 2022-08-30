# OBSERVATION
$files = Get-ChildItem "./BDD/OBSERVATION/"
foreach ($f in $files){
	$fichier = $f.Name
    $espece = $f.Name -replace ".csv"
	$kml =	@"
	<?xml version="1.0" encoding="UTF-8"?>
	<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
	<Document>
	<name>$espece</name>
	<Folder>
	<name>INATURALIST</name>
	$(
	Import-Csv "./BDD/OBSERVATION/$fichier" | 
	foreach {
	'<Placemark>
	<IconStyle>
	<color>red</color>
	<Icon>
	</Icon>
	</IconStyle>
	<Point>
	<coordinates>{1},{0}</coordinates>
	</Point>
	</Placemark>
	
	' -f $_.Latitude, $_.Longitude
	}
	)
	</Folder>
	</Document>
	</kml>"@
	
	$kml | Out-File -Force -Encoding ascii ("./BDD/OBSERVATION/$espece.kml")
	
}

# INATURALIST
$files = Get-ChildItem "./BDD/INATURALIST/"
foreach ($f in $files){
	$fichier = $f.Name
    $espece = $f.Name -replace ".csv"
	$kml = @"
	<?xml version="1.0" encoding="UTF-8"?>
	<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
	<Document>
	<name>$espece</name>
	<Folder>
	<name>INATURALIST</name>
	$(
	Import-Csv "./BDD/INATURALIST/$fichier" | 
	foreach {
	'<Placemark>
	<IconStyle>
	<color>red</color>
	<Icon>
	</Icon>
	</IconStyle>
	<Point>
	<coordinates>{1},{0}</coordinates>
	</Point>
	</Placemark>
	
	' -f $_.Latitude, $_.Longitude
	}
	)
	</Folder>
	</Document>
	</kml>"@
	
	$kml | Out-File -Force -Encoding ascii ("./BDD/INATURALIST/$espece.kml")
	
}
