$regex = '<a href="([^"]*)">(.[a-z].+)</a>.([a-z].+)<br>'

foreach($line in Get-Content ./ONEM/index.html) {
    if($line -match $regex){
		$url = $matches[1]
		$sci1 = $matches[2]
		$sci = $sci1 -replace " ","_"
		$ver = $matches[3]
		Invoke-WebRequest -Uri $url -OutFile "sp.html"
		$Source = Get-Content -path "sp.html" -raw
		$Source -match 'tools/cartowiki/CACHE/(.*).jpg'
		$Sourceurl = $matches[1]
        Echo $sci1
		Invoke-WebRequest -Uri "http://www.onem-france.org/cigales/tools/cartowiki/CACHE/$Sourceurl.jpg" -OutFile "./BDD/ONEM/$sci.jpg"

    }
}

Remove-Item "sp.html"

# git
git config --local user.email "cigalesdefrance@outlook.fr"
git config --local user.name "cigalesdefrance"
git add .
git commit -m "[Bot] Sauvegarde des cartes de l'ONEM" #--allow-empty
git push -f