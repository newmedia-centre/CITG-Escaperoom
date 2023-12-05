export default {
	0: [
		'Om deze puzzel op te lossen moet je de snelheid van de kogel en het hoogteverschil en de afstand tussen het kanon en de rode knop weten te vinden in de ruimte.',
		'De snelheid van de kogel staat op de zijkant van het kanon. Gebruik de hoogtemeter aan de linkerkant om het hoogteverschil te bepalen. Let daarbij op de waterdiepte en de ligging van de rode knop. Gebruik de blueprints aan de rechterkant om de afstand te bepalen. ',
		'Pas de formules voor de kinematica van een puntmassa toe in x- en y-richting. Dan krijg je twee formules met twee onbekenden, en dat kan je oplossen.',
		'De versnelling in beide richtingen is constant. In de x-richting is de versnelling 0 en in de y-richting heb je de gravitatieversnelling g.',
		`Los θ op uit de volgende vergelijkingen:
			a. In x-richting: x_knop=v_kogel*cos⁡(θ)*t
			b. In y-richting: y_knop=y_kanon+v_kogel*sin⁡(θ)*t-1/2*g*t^2

Vul deze waarde rechtsboven in en klik op vuur!`
	],
	1: [
		'Wat moeten jullie hier precies doen? Eerst moet een puzzelstuk op de juiste plek met de juiste oriëntatie op de linker tafel worden geplaatst. Per puzzelstuk moeten jullie op de locatie van het OR van de blauwe staaf klikken. Als jullie op de juiste locatie klikken, zien jullie een groene stip en anders een rode. De puzzel is opgelost wanneer dat voor alle vier de puzzelstukken is gelukt.',
		'Check de getallen op de puzzelstukken en op de tafel. Het nummer op de puzzelstukken is een verwijzing naar de plaatsing op het bord. Klik om de puzzelstukken rond te draaien en sleep ze vervolgens naar de linker tafel.',
		'We zoeken naar het rotatiecentrum van iedere blauwe staaf. Kunnen jullie dat achterhalen op basis van de bewegingen die jullie zien?',
		'De rode pijlen aan een of beide uiteinden van de blauwe staaf staan voor de snelheidsvectoren en geven de bewegingsrichting aan. Hoe bepaal je dan het rotatiecentrum?',
		'Het rotatiecentrum is het snijpunt van de loodlijnen van de snelheidsvectoren, die horen bij de uiteinden van de staaf.'
	],
	2: [
		'Wat gebeurt hier precies? Het object uit de kast rolt zonder te slippen of te glijden over de bank. Via het katrolsysteem beweegt het blok naar beneden en passeert een acceleratiesensor. Als die acceleratiesensor de gewenste waarde aangeeft is de puzzel opgelost.',
		'Het gewicht van het blok staat op de buitenkant van de ruimte. De gewenste acceleratie van het blok is het groene gebied.',
		'Teken het vrijlichaamsdiagram van het object en het blok. Gebruik de bewegingsvergelijkingen (tweede wet van Newton) zowel voor het object als voor het blok. Dan krijgen jullie twee vergelijkingen met vijf onbekenden. Welke informatie kun je gebruiken uit de kinematica van het systeem om meer vergelijkingen op te stellen?',
		'Voor het blok heb je de som van de krachten in de verticale richting nodig. Pas de momentvergelijking voor het object toe ten opzichte van het contactpunt van het object met de bank. Het traagheidsmoment hangt af van de vorm en de massa van het gekozen object, zoals te zien is in de kamer. Dan door naar de kinematica. De versnelling van het object kan worden gerelateerd aan de versnelling van het blok omdat ze middels het katrolsysteem zijn verbonden. Het feit dat het object over de bank rolt zonder te slippen of te glijden maakt het mogelijk om zijn hoekversnelling en versnelling te linken.',
		`Bepaal voor elk type object welke massa van het object voldoet aan de volgende vergelijkingen:
			- I_a ∶=Xm*r^2
			- T*r = (Xm*r^2  + I_a)*α_a
			- -g*m_blok+ 2*T = m_blok*a_blok
			- a_a= r*α_a
Check of de combinatie van massa en type object beschikbaar is in de kast. Kies het object waarvoor dit het geval is en klik op activeren.`
	],
	3: [
		'Om deze puzzel op te lossen moet je het gewicht en de doelversnelling weten te vinden in de ruimte. Bekijk ook uit welke duwkrachten en vloertypen je kunt kiezen. Wat verandert er als je een andere ondergrond gebruikt om de boot overheen te duwen richting de glijbaan?',
		'Maak een vrijlichaamsdiagram om te bekijken welke krachten er op de boot werken.',
		'Als het goed is, moet je vier krachten in je vrijlichaamsdiagram hebben getekend. Gebruik de bewegingsvergelijking (tweede wet van Newton) om de krachten aan de versnelling te relateren.',
		'Denk eraan dat de wrijvingskracht afhankelijk is van de wrijvingscoëfficiënt behorend bij een vloertype en het gewicht.',
		`Los de volgende vergelijking op met als onbekenden μ en F_duw:
			- F_duw-μ*m*g=m*a
Check welke combinatie van duwkracht en vloertype beschikbaar is op het panel. Kies deze en klik op activeren.`,
	]
}