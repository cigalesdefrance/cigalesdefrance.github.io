$cigales_codes = Import-Csv "CIGALES-CODES.csv"
Remove-Item "./BDD/INATURALIST/*.csv"
Remove-Item "./BDD/GBIF/*.csv"
$cigales_codes | ForEach-Object {
	$nom = $_.NOM_SCIENTIFIQUE
	$onem = $_.ONEM
	$faune_france = $_.FAUNEFRANCE
	$inpn = $_.INPN
	$inaturalist = $_.INATURALIST
	$observation = $_.OBSERVATION
	
	#ONEM - voir https://github.com/cigalesdefrance/cigalesdefrance.github.io/blob/main/SCRIPTS/sauvegarde_onem.ps1
	
	#FAUNE-FRANCE
	"Faune-France - $nom"
	if ($faune_france -eq "") {
	"  > L'espèce n'existe pas dans Faune-France" }
	else {
	Invoke-WebRequest -Uri "https://www.faune-france.org/index.php?m_id=95&sp_tg=19&sp_DChoice=all&sp_SChoice=species&sp_PChoice=all&sp_FChoice=map&sp_S=$faune_france" -OutFile "./BDD/FAUNE-FRANCE/$nom.png" }
	
	#INPN
	
	#INATURALIST
	"Inaturalist - $nom"
	if ($inaturalist -eq "") {
	"  > L'espèce n'existe pas dans Inaturalist" }
	else {
		Add-Content "./BDD/INATURALIST/$nom.csv" "Latitude,Longitude"
		$total_results = (Invoke-WebRequest "https://api.inaturalist.org/v1/observations?&place_id=6753&taxon_id=$inaturalist" | ConvertFrom-Json).total_results
		if ($total_results -eq 0) {
		"  > L'espèce est présente dans Inaturalist mais ne possède aucune donnée" }
		else {
			$pages = [math]::ceiling($total_results/200)
			for ($num=1;$num -le $pages;$num++) {
				"page $num sur $pages"
			(Invoke-WebRequest "https://api.inaturalist.org/v1/observations?&place_id=6753&taxon_id=$inaturalist&page=$num&per_page=200" | ConvertFrom-Json).results.location | Add-Content "./BDD/INATURALIST/$nom.csv" }		
		}}
		
		#OBSERVATION.ORG
		"Observation.org - $nom"
		if ($observation -eq "") {
		"  > L'espèce n'existe pas dans Observation" }
		else {
			[xml]$data = (invoke-webrequest -Uri "https://france.observation.org/kmlloc/soort_get_xml_points.php?soort=$observation")
			$observation = $data.markers.line.point
			if ($observation.count -eq 0) {
			"  > L'espèce est présente dans Observation mais ne possède aucune donnée" }
			else {
				$observation | Out-File "observation.txt"
				(Get-Content "observation.txt" | Select-Object -Skip 2) | Set-Content "observation.txt"
				$observation = Get-Content "observation.txt"
				$observation[0] = "Latitude,Longitude"
				$observation = $observation -replace " ",","
				$observation | Out-File "./BDD/OBSERVATION/$nom.csv"
			Remove-Item "observation.txt" }}
			
			#GBIF
			"GBIF - $nom"
			if ($inaturalist -eq "") {
			"  > L'espèce n'existe pas dans GBIF" }
			else {
				Add-Content "./BDD/GBIF/$nom.csv" "Latitude,Longitude"
				$count = (Invoke-WebRequest "https://api.gbif.org/v1/occurrence/search?country=FR&taxon_key=$gbif" | ConvertFrom-Json).count
				if ($count -eq 0) {
				"  > L'espèce est présente dans GBIF mais ne possède aucune donnée" }
				else {
					$pages = [math]::floor($count/300)
					for ($num=0;$num -le $pages;$num++) {
						if ($num -eq 0) {$offset=0} else {$offset = ($num*300)}
						$offset
						"page $num sur $pages"
						$lat = (Invoke-WebRequest "https://api.gbif.org/v1/occurrence/search?country=FR&taxon_key=$gbif&offset=$offset&limit=300" | ConvertFrom-Json).results.decimalLatitude | Add-Content "lat.csv" 
						$long = (Invoke-WebRequest "https://api.gbif.org/v1/occurrence/search?country=FR&taxon_key=$gbif&offset=$offset&limit=300" | ConvertFrom-Json).results.decimalLongitude | Add-Content "long.csv" 
						
					}
					
					$lat = Get-content "lat.csv"
					$long = Get-content "long.csv"
					$(for($index=0;$index -lt $lat.Count;$index++){$lat[$index] + "," + $long[$index]}) | Add-Content "./BDD/GBIF/$nom.csv"
					(Get-Content "./BDD/GBIF/$nom.csv") | ? {$_.trim() -ne "" } | Set-Content "./BDD/GBIF/$nom.csv"
				}}
				
				Remove-item "lat.csv"
				Remove-item "long.csv"	
}

### CREATION DES KML
# OBSERVATION
$files = Get-ChildItem "./BDD/OBSERVATION/" -Filter *.csv
foreach ($f in $files){
	$fichier = $f.Name
    $espece = $f.Name -replace ".csv"
	$kml =
	"<?xml version=`"1.0`" encoding=`"UTF-8`"?><kml xmlns=`"http://www.opengis.net/kml/2.2`">
	<Document>
	<Style id=`"observation`"><IconStyle><scale>0.3</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/red-circle-lv.png</href></Icon></IconStyle></Style>
	<name>$espece</name>
	<Folder>
	<name>INATURALIST</name>
	$(Import-Csv "./BDD/OBSERVATION/$fichier" | foreach {'<Placemark><styleUrl>#observation</styleUrl><Point><coordinates>{1},{0}</coordinates></Point></Placemark>' -f $_.Latitude, $_.Longitude})
	</Folder>
	</Document>
	</kml>"
	
	$kml | Out-File -Force -Encoding ascii ("./BDD/OBSERVATION/$espece.kml")
	
}

# INATURALIST
$files = Get-ChildItem "./BDD/INATURALIST/" -Filter *.csv
foreach ($f in $files){
	$fichier = $f.Name
    $espece = $f.Name -replace ".csv"
	$kml =
	"<?xml version=`"1.0`" encoding=`"UTF-8`"?><kml xmlns=`"http://www.opengis.net/kml/2.2`">
	<Document>
	<Style id=`"inaturalist`"><IconStyle><scale>0.3</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/grn-circle-lv.png</href></Icon></IconStyle></Style>
	<name>$espece</name>
	<Folder>
	<name>INATURALIST</name>
	$(Import-Csv "./BDD/INATURALIST/$fichier" | foreach {'<Placemark><styleUrl>#inaturalist</styleUrl><Point><coordinates>{1},{0}</coordinates></Point></Placemark>' -f $_.Latitude, $_.Longitude})
	</Folder>
	</Document>
	</kml>"
	
	$kml | Out-File -Force -Encoding ascii ("./BDD/INATURALIST/$espece.kml")
	
# GBIF
$files = Get-ChildItem "./BDD/GBIF/" -Filter *.csv
foreach ($f in $files){
	$fichier = $f.Name
    $espece = $f.Name -replace ".csv"
	$kml =
	"<?xml version=`"1.0`" encoding=`"UTF-8`"?><kml xmlns=`"http://www.opengis.net/kml/2.2`">
	<Document>
	<Style id=`"gbif`"><IconStyle><scale>0.3</scale><Icon><href>https://maps.google.com/mapfiles/kml/paddle/blu-circle-lv.png</href></Icon></IconStyle></Style>
	<name>$espece</name>
	<Folder>
	<name>INATURALIST</name>
	$(Import-Csv "./BDD/GBIF/$fichier" | foreach {'<Placemark><styleUrl>#gbif</styleUrl><Point><coordinates>{1},{0}</coordinates></Point></Placemark>' -f $_.Latitude, $_.Longitude})
	</Folder>
	</Document>
	</kml>"
	
	$kml | Out-File -Force -Encoding ascii ("./BDD/GBIF/$espece.kml")
	
}
# git
git config --local user.email "cigalesdefrance@outlook.fr"
git config --local user.name "cigalesdefrance"
git add .
git commit -m "[Bot] Téléchargement des données + kml"
git push -f
