$cigales_codes = Import-Csv "CIGALES-CODES.csv"
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
		"Pas de données pour l'espèce dans Faune-France" }
		else {
		Invoke-WebRequest -Uri "https://www.faune-france.org/index.php?m_id=95&sp_tg=19&sp_DChoice=all&sp_SChoice=species&sp_PChoice=all&sp_FChoice=map&sp_S=$faune_france" -OutFile "./FAUNE-FRANCE/$nom.png" }
		
		#INPN
		
		#INATURALIST
		"Inaturalist - $nom"
		if ($faune_france -eq "") {
		"Pas de données pour l'espèce dans INaturalist" }
		else {
		Add-Content "./INATURALIST/$nom.csv" "Latitude,Longitude"
		$total_results = (Invoke-WebRequest "https://api.inaturalist.org/v1/observations?&place_id=6753&taxon_id=$inaturalist" | ConvertFrom-Json).total_results
		$pages = [math]::ceiling($total_results/200)
		for ($num=1;$num -le $pages;$num++) {
		"page $num sur $pages"
		(Invoke-WebRequest "https://api.inaturalist.org/v1/observations?&place_id=6753&taxon_id=$inaturalist&page=$num&per_page=200" | ConvertFrom-Json).results.location | Add-Content "./INATURALIST/$nom.csv" }		
		}
		
		#OBSERVATION.ORG
		"Observation.org - $nom"
		if ($faune_france -eq "") {
		"Pas de données pour l'espèce dans Observation.org" }
		else {
		[xml]$data = (invoke-webrequest -Uri "https://france.observation.org/kmlloc/soort_get_xml_points.php?soort=$observation")
		$observation = $data.markers.line.point
		$observation | Out-File "observation.txt"
		(Get-Content "observation.txt" | Select-Object -Skip 2) | Set-Content "observation.txt"
		$observation = Get-Content "observation.txt"
		$observation[0] = "Latitude,Longitude"
		$observation = $observation -replace " ",","
		$observation | Out-File "./OBSERVATION/$nom.csv"
		Remove-Item "observation.txt" }
    }

# git
git config --local user.email "cigalesdefrance@outlook.fr"
git config --local user.name "cigalesdefrance"
git add .
git commit -m "[Bot] Téléchargement des données"
git push -f