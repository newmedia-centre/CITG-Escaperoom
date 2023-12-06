import React, { useState } from 'react'
import { Button, Stack, List, ListItem, Divider, Input, Card, Typography, ButtonGroup } from '@mui/joy'

export default function WelcomeScreen({ onSubmit, setPlayerIDInput, playerIDInput, registerPlayer }) {

    const [currentPage, setCurrentPage] = useState(0)

    const renderPage = () => {
        switch (currentPage) {
            case 0:
                return <>
                    <Typography level="h1">Welkom!</Typography><Typography level="h3">bij deze Dynamica escape room! </Typography>
                    <Typography level="body-md">Tegenwoordig bevinden we ons in een wereld waarin de effecten van zeespiegelstijging ons allemaal raken. Maar vandaag is er iets rampzaligs gebeurd. Door een storm is een deel van het land ondergelopen en het is jullie taak als civiel ingenieurs om ervoor te zorgen dat de Deltawerken geactiveerd worden.</Typography>
                    <Typography level="body-md">De oplossing voor het sluiten van de Deltawerken ligt verborgen in een reeks uitdagende dynamische puzzels. Deze opgaven testen jullie kennis en vaardigheden op het gebied van krachten en beweging. Alleen door teamwork, slim denken en de juiste toepassing van dynamische principes kunnen jullie deze puzzels oplossen en de deltawerken activeren voordat het te laat is.</Typography>
                    <Typography level="body-md">
                        Let op: in deze escape room gebruiken we dat de gravitatieversnelling g gelijk is aan 9.81 m/s2.
                    </Typography>
                </>
            case 1:
                return <>
                    <Typography level="h3">Spelregels en praktische zaken</Typography>
                    <List
                        sx={{
                            textAlign: 'left',
                            justifyContent: 'left',
                            alignItems: 'left',
                            listStyleType: 'disc',
                            pl: 2,
                            '& .MuiListItem-root': {
                                display: 'list-item',
                            },
                        }}>
                        <ListItem>
                            Jullie missie omvat het oplossen van vier puzzels op verschillende locaties, maar hier is de catch: de volgende locatie wordt pas bekendgemaakt nadat jullie geprobeerd hebben de puzzel op te lossen.
                        </ListItem>
                        <ListItem>
                            Om de puzzels te openen scan je de QR code met je telefoon.
                        </ListItem>
                        <ListItem>
                            Bereken de oplossing voor elke puzzel en voer deze in. Bij een fout antwoord verlies je punten, en je hebt slechts drie pogingen per puzzel, dus denk goed na voordat je een antwoord indient. Per verkeerd antwoord gaan er 20 punten af.
                        </ListItem>
                        <ListItem>
                            We begrijpen dat zelfs de slimsten onder ons soms vastlopen, dus er zijn maximaal 5 hints per puzzel beschikbaar om jullie op weg te helpen. Maar let op: als je besluit een hint te gebruiken, verlies je 10 punten, dus gebruik ze met mate!
                        </ListItem>
                        <ListItem>
                            Per puzzel kunnen jullie maximaal 100 punten verdienen.
                        </ListItem>
                        <ListItem>
                            Jullie kunnen na afloop de scores van andere teams volgen op ons leaderboard, dus zorg ervoor dat je je best doet om bovenaan te staan als ware dynamica-experts. Voor het winnende team is er zelfs een prijs!
                        </ListItem>
                        <ListItem>
                            Jullie hebben in totaal 1,5 uur de tijd om deze missie te voltooien, dus houd de tijd goed in de gaten!
                        </ListItem>
                    </List>
                </>
            case 2:
                return <>
                    <Typography level="h3">Op weg naar de eerste puzzel </Typography>
                    <Typography level="body-md">
                        De klok tikt, de druk neemt toe en het lot van ons land ligt in jullie handen. Ga de uitdaging aan, werk samen als nooit tevoren en laat zien dat jullie de toekomst van ons land veilig kunnen stellen. Red onze kusten, sluit de deltawerken en triomfeer over de dynamica escape room!</Typography>
                    <Typography level="body-md">
                        De eerste puzzel is te vinden waar je het onderzoek naar beton en staal kunt bewonderen. (Oftewel, ga naar Stevinlab 2.) De tijd start zodra jullie de QR code van de eerste puzzel op de locatie hebben gescand.
                    </Typography>
                    <Divider />
                    <Typography variant="soft" level="body-md">Vul hieronder je groepsnaam in om te beginnen.</Typography>
                    <form onSubmit={onSubmit}>
                        <Stack spacing={1}>
                            <Input placeholder="Voer een groepsnaam in..." variant="plain" required value={playerIDInput} onChange={e => setPlayerIDInput(e.target.value)} />
                            <Button type={"submit"} onClick={registerPlayer} size="lg">Start</Button>
                        </Stack>
                    </form>
                </>
        }
    }

    const handleClick = (i) => {

        if (currentPage + i < 0 || currentPage + i > 2) return
        setCurrentPage(currentPage + i)
    }

    return (
        <Stack
            spacing={2}
            position={"absolute"}
            direction={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            textAlign={"center"}
            display={"flex"}
            height={"100vh"}
            width={"100vw"}
            sx={{
                backgroundColor: "rgba(0,0,0,0.94)",
                userSelect: "none",
                zIndex: 90000,
            }}
        >
            {/* Use switch case to render page */}
            <Card variant="soft"
                sx={{
                    m: 2,
                    overflowY: 'scroll',
                    paddingBottom: '64px'
                }}>
                {renderPage()}

                <Divider />
                <ButtonGroup orientation="horizontal" variant="solid" size="md" sx={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <Button onClick={() => handleClick(-1)} size="lg">Vorige</Button>
                    <Button onClick={() => handleClick(1)} size="lg">Volgende</Button>
                </ButtonGroup>
            </Card>
        </Stack >
    )
}