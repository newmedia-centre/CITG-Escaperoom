// Index.jsx
import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import Level01 from "./Level01"
import Level02 from "./Level02"
import Level03 from "./Level03"
import Level04 from "./Level04"
import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { CircularProgress, Typography, Button, IconButton, ButtonGroup, LinearProgress, Input, Card, List, ListItem, Divider, Textarea } from "@mui/joy";
import { QuestionMark, Close } from "@mui/icons-material";
import { Stack } from '@mui/material';
import { Physics, Debug } from "@react-three/cannon";
import ConfettiExplosion from "react-confetti-explosion";
import GaugeComponent from "react-gauge-component";
import { Leva } from "leva"
import DatabaseClient from "./DatabaseClient"
import hints from './hints'
import gameMessages from "./game-messages"

function App() {
  const cannonRef = useRef()
  const [fireCannon, setFireCannon] = useState(null)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [resetGame, setResetGame] = useState(false)
  const [showHintPopup, setShowHintPopup] = useState(false)
  const [speed, setSpeed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(5400)
  const [playerID, setPlayerID] = useState(localStorage.getItem('player') ?? '')
  const [playerState, setPlayerState] = useState()
  const [playerIDInput, setPlayerIDInput] = useState('')
  const [animationProgress, setAnimationProgress] = useState(0)

  const level02Ref = useRef()
  const level04Ref = useRef()
  const totalTimeInMilliseconds = 90 * 60 * 1000

  // Sets the current level based on the url query params
  const currentLevel = useMemo(() => {
    const urlLevel = new URLSearchParams(window.location.search).get('zwvkhnpl')
    switch (urlLevel) {
      case 'wjaejhjc':
        return 0;
      case 'uijyaqlq':
        return 1;
      case 'jjsnavux':
        return 2;
      case 'dweqiufh':
        return 3;
      default:
        return 0;
    }
  }, [window.location.search])

  // Adds player to database and starts the game
  const registerPlayer = async () => {
    if (!playerIDInput) return

    // store player in localStorage and state
    localStorage.setItem('player', playerIDInput)

    // check to see if player exists
    const token = await DatabaseClient.auth().catch(e => console.error(e))
    const existing = await DatabaseClient.read(playerIDInput, token).catch(e => console.error(e))

    // create player if it doesnt exist
    if (!existing) {
      await DatabaseClient.add(playerIDInput, { StartTime: Date.now() }, token)
    }

    setPlayerID(playerIDInput)
  }

  // Fire cannon
  const fireCannonBall = () => {
    if (fireCannon) {
      fireCannon()
    }
  }

  const handleActivateClick = () => {
    level02Ref.current.activatePulley()
  }

  const handleResetClick = () => {
    level02Ref.current.resetLevel()
  }

  // Reset game
  const retry = () => {
    setGameOver(false)
    setGameWon(false)
    setLives(3)
    setResetGame(true)
  }

  // To prevent page refresh on form submit
  const onSubmit = (e) => {
    e.preventDefault()
  }

  // Get player state from database
  useEffect(() => {
    if (!playerID) {
      setPlayerState(null)
      return
    }

    const get = async () => {
      const token = await DatabaseClient.auth().catch(() => setPlayerState(null))
      const state = await DatabaseClient.read(playerID, token).catch(() => setPlayerState(null))
      setPlayerState(state === undefined ? null : state)
    }

    get()
  }, [playerID])

  // Set StartTime to player state inside the current level object
  useEffect(() => {
    if (!playerState) return

    setPlayerState(prev => {
      if (!prev[`Level${currentLevel + 1}`]) {
        return {
          ...prev, [`Level${currentLevel + 1}`]: { StartTime: Date.now() }
        }
      }

      return prev
    })
  }, [currentLevel, playerState])

  // Set lives to player state
  useEffect(() => {
    if (!playerState) return

    setPlayerState(prev => {
      // TODO: check if this is correct
      if (!prev?.Lost && !prev?.Won) {
        const levelState = { ...prev[`Level${currentLevel + 1}`], lives: lives }
        return {
          ...prev, [`Level${currentLevel + 1}`]: levelState
        }
      }

      // If player has no lives left in current level set lost in currentlevel to true
      if (prev[`Level${currentLevel + 1}`].lives === 1 && !prev.Won && !prev.Lost) {
        setGameOver(true)
        return { ...prev, [`Level${currentLevel + 1}`]: { ...prev[`Level${currentLevel + 1}`], EndTime: Date.now(), Lost: true } }
      }

      return prev
    })
  }, [lives, currentLevel])

  useEffect(() => {
    if (!playerState) return

    // If player has won set won to true
    if (gameWon && !playerState?.Won && !playerState?.Lost) {
      setGameWon(true)
      setPlayerState(prev => ({
        ...prev, [`Level${currentLevel + 1}`]: { ...prev[`Level${currentLevel + 1}`], EndTime: Date.now(), Won: true }
      }))
    }
  }, [gameWon, currentLevel])

  // Game over when time runs out
  useEffect(() => {
    if (!playerState) return

    if (playerState.StartTime + totalTimeInMilliseconds < Date.now() && !playerState.Won) {
      setGameOver(true)
      setPlayerState(prev => ({ ...prev, EndTime: prev.StartTime + totalTimeInMilliseconds, Lost: true }))
    }
  }, [playerState])

  // Update database on state change
  useEffect(() => {
    const update = async () => {
      const token = await DatabaseClient.auth().catch(() => setPlayerState(null))
      await DatabaseClient.update(playerID, playerState, token)
    }

    if (playerState) {
      update()
    }
  }, [playerID, playerState])

  // Set TimeRemaining
  useEffect(() => {
    if (!playerState) return

    const interval = setInterval(() => {
      setTimeRemaining((playerState.StartTime + totalTimeInMilliseconds - Date.now()) / 1000)
    }, 1000);
    return () => clearInterval(interval);
  }, [playerState])

  // return loading page if playerstate is undefined
  if (playerState === undefined) {
    return (<div style={{ padding: '16px' }}>Loading...</div>)
  }

  return (
    <>
      {/* If player name is not found register new Player */}
      {playerState === null && (
        <>
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
              backgroundColor: "rgba(0,0,0,0.74)",
              userSelect: "none",
              zIndex: 90000,
            }}
          >
            <Card variant="soft" sx={{
              m: 2,
              overflowY: 'scroll'
            }}>
              <Typography level="h1">Welkom!</Typography>
              <Typography level="h3">Team van toegewijde civieltechnici, bij deze Dynamica escape room!</Typography>
              <Typography level="body-md">Tegenwoordig bevinden we ons in een wereld waarin de effecten van zeespiegelstijging ons allemaal raken. Maar vandaag is er iets rampzaligs gebeurd. Door een storm is een deel van het land ondergelopen en het is jullie taak als civiel ingenieurs om ervoor te zorgen dat de Deltawerken geactiveerd worden.</Typography>
              <Typography level="body-md">De oplossing voor het sluiten van de Deltawerken ligt verborgen in een reeks uitdagende dynamische puzzels. Deze opgaven testen jullie kennis en vaardigheden op het gebied van krachten en beweging. Alleen door teamwork, slim denken en de juiste toepassing van dynamische principes kunnen jullie deze puzzels oplossen en de deltawerken activeren voordat het te laat is.</Typography>
              <Typography level="body-md">Let op: in deze escape room gebruiken we dat de gravitatieversnelling g gelijk is aan 9.81 m/s².</Typography>
              <Typography level="body-md">Voordat we beginnen, laten we de spelregels en praktische zaken even doornemen.</Typography>
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
                  Jullie missie omvat vier cruciale puzzels op verschillende locaties, maar hier is de catch: de volgende locatie wordt pas bekendgemaakt nadat jullie geprobeerd hebben de puzzel op te lossen.
                </ListItem>
                <ListItem>
                  Om de puzzels te openen scan je de QR code met je telefoon.
                </ListItem>
                <ListItem>
                  Jullie hebben in totaal 1,5 uur de tijd om deze missie te voltooien, dus houd de tijd goed in de gaten!
                </ListItem>
                <ListItem>
                  We begrijpen dat zelfs de slimsten onder ons soms vastlopen, dus er zijn hints beschikbaar om jullie op weg te helpen. Maar let op: als je besluit een hint te gebruiken, verlies je kostbare punten, dus gebruik ze met mate!
                </ListItem>
                <ListItem>
                  Jullie zullen de voortgang van andere teams kunnen volgen op ons leaderboard, dus zorg ervoor dat je je best doet om bovenaan te staan als ware dynamica-experts. Voor het winnende team is er zelfs een prijs!
                </ListItem>
                <ListItem>
                  Hier is een cruciale tip: bij een fout antwoord verlies je punten, en je hebt slechts drie pogingen per vraag, dus denk goed na voordat je een antwoord indient. Per vraag kunnen jullie 100 punten verdienen. Per verkeerd antwoord gaan er 20 punten af en per gebruikte hint 10 punten.
                </ListItem>
              </List>
              <Typography level="body-md">De klok tikt, de druk neemt toe en het lot van ons land ligt in jullie handen. Ga de uitdaging aan, werk samen als nooit tevoren en laat zien dat jullie de toekomst van ons land veilig kunnen stellen. Red onze kusten, sluit de deltawerken en triomfeer over de dynamica escape room!</Typography>
              <Typography level="body-md">De eerste puzzel is te vinden waar je het onderzoek naar beton en staal kunt bewonderen. (Oftewel, ga naar Stevinlab 2.) De tijd start zodra jullie de QR code van de eerste puzzel op de locatie hebben gescand.</Typography>
              <Divider />
              <Typography variant="soft" level="body-md">Vul hieronder je groepsnaam in om te beginnen.</Typography>

              <form onSubmit={onSubmit} >
                <Stack spacing={1}>
                  <Input placeholder="Voer een groepsnaam in..." variant="plain" required value={playerIDInput} onChange={e => setPlayerIDInput(e.target.value)} />
                  <Button type={"submit"} onClick={registerPlayer} size="lg">Start</Button>
                </Stack>
              </form>
            </Card>
          </Stack>
        </>
      )
      }

      {
        showHintPopup && (
          <HintPopup playerState={playerState} setPlayerState={setPlayerState} currentLevel={currentLevel} setShowHintPopup={setShowHintPopup} />
        )
      }


      {
        !gameOver && !gameWon ? (
          <>
            <Stack direction="column" spacing={3} sx={{
              position: 'absolute',
              width: '100%',
              bottom: '4px',
              right: '0',
              zIndex: 20000,
            }}>
              <IconButton variant="solid" color="warning" aria-label="Open in new tab" onClick={() => setShowHintPopup(!showHintPopup)}
                sx={{
                  position: 'absolute',
                  bottom: '38px',
                  right: '20px',
                  pr: 1.4,
                }}>
                <QuestionMark />
                Hints
              </IconButton>
              <TimeRemaining timeRemaining={timeRemaining} totalTimeInMilliseconds={totalTimeInMilliseconds} />
            </Stack>


            {currentLevel === 0 && (
              <Stack direction="row" spacing={3} justifyContent="center"
                sx={{
                  position: 'absolute',
                  bottom: '32px',
                  left: '50%',
                  transform: 'translate(-50%, -20%)',
                  userSelect: 'none',
                }}
                zIndex={10000}>
                <Button onClick={fireCannonBall} variant="solid" size="lg" color="danger">Vuur!</Button>
                <Typography level="h6" color="neutral" variant="soft">Pogingen:{lives}</Typography>
              </Stack >
            )}
            {currentLevel === 1 && (
              <Stack direction="row" spacing={1} flexWrap={"wrap"} useFlexGap sx={{
                position: 'absolute',
                bottom: '32px',
                left: '12px',
                userSelect: 'none',
                userEvents: 'none',
                zIndex: 10000,
              }}>
                {/* Left Panel */}
                <Stack spacing={1} p={2}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    opacity: 0.95,
                    backgroundColor: '#181c20',
                    userSelect: 'none',
                    userEvents: 'none',
                  }}
                >
                  <Button onClick={() => {
                    handleActivateClick()
                  }}>Activeren</Button>
                  <Button onClick={() => handleResetClick()}>Reset</Button>
                </Stack>
                {/* Right Panel */}
                <Stack direction="column" spacing={1} justifyContent="center" p={1}
                  sx={{
                    userSelect: 'none',
                    userEvents: 'none',
                    borderRadius: 2,
                    boxShadow: 2,
                    opacity: 0.95,
                    backgroundColor: '#181c20',
                  }}
                >
                  <GaugeComponent
                    style={{
                      width: '240px',
                    }}
                    type="semicircle"
                    value={speed}
                    minValue={-2}
                    maxValue={0}
                    arc={{
                      width: 0.22,
                      padding: 0,
                      cornerRadius: 0,
                      subArcs: [
                        { limit: -1.5, color: '#EA4228', showTick: true },
                        { limit: -1.1, color: '#F5CD19', showTick: true },
                        { limit: -0.9, color: '#5BE12C', showTick: true },
                        { limit: -0.5, color: '#F5CD19', showTick: true },
                        { color: '#EA4228' }
                      ]
                    }}
                    pointer={{
                      color: '#3c93ff',
                      length: 0.80,
                      width: 14,
                      elastic: true,
                      animationDuration: 1000
                    }}
                    labels={{
                      tickLabels: {
                        defaultTickValueConfig: {
                          style: { fontSize: 18 }
                        }
                      }
                    }}
                  />
                  <Typography level="h5" color="danger">Pogingen: {lives}</Typography>

                </Stack >
              </Stack>
            )}
            {currentLevel === 3 && (
              <Stack direction="row" spacing={1} flexWrap={"wrap"} useFlexGap sx={{
                position: 'absolute',
                m: 1,
                bottom: '32px',
                left: '0',
                zIndex: 10000,
              }}>
                <Button onClick={() => level04Ref.current.play()}>Duw boot</Button>
              </Stack>
            )}
          </>
        ) : gameWon ? ( // If game is won show win screen
          <>
            <WinScreen onRetry={retry} currentLevel={currentLevel} />
          </>
        ) : ( // If game is lost show game over screen
          <GameOverScreen onRetry={retry} currentLevel={currentLevel} />
        )
      }

      <div className="ignore-select"
        style={{
          width: 350,
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 100,
          opacity: 0.95
        }}
      >
        <Leva fill />
      </div>
      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, localClippingEnabled: true }}
      >
        <Suspense fallback={<Loader />}>
          <Physics >
            {/* <Debug> */}
            {currentLevel === 0 && (
              <Level01 cannonRef={cannonRef} setFireFunction={setFireCannon} lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} resetGame={resetGame} setResetGame={setResetGame} />
            )}
            {currentLevel === 1 && (
              <Level02
                ref={level02Ref}
                speed={speed}
                setSpeed={setSpeed}
                lives={lives}
                setLives={setLives}
                setGameWon={setGameWon}
                gameWon={gameWon}
                gameOver={gameOver}
                setGameOver={setGameOver} resetGame={resetGame} setResetGame={setResetGame}
                animationProgress={animationProgress}
                setAnimationProgress={setAnimationProgress}
              />
            )}
            {currentLevel === 2 && (
              <Level03 lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} setResetGame={setResetGame} resetGame={resetGame} />
            )}
            {currentLevel === 3 && (
              <Level04 ref={level04Ref} lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} setResetGame={setResetGame} resetGame={resetGame} />
            )}

            {/* </Debug> */}
          </Physics>
        </Suspense>
      </Canvas>
      <div id="info-box">
        <div id="comment">
          <div style={{ marginBottom: 4 }}>
            Built by — <img src="/xrzone-16x16.png" /> Zone
          </div>
          <img src="tudelft-nmc-200px.png" />
        </div>
      </div>

    </>
  )
}

function GameOverScreen({ onRetry, currentLevel }) {
  return (
    <Stack spacing={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        userSelect: 'none'
      }}
    >
      <Card color="neutral" sx={{
        backgroundColor: 'rgba(22, 22, 22, 1)',
        p: 2,
        textAlign: 'center',
        color: "gray"
      }}>
        <Typography level="h2" color="danger">Game Over</Typography>
        <Typography level="body-md">{gameMessages.messages[currentLevel]?.lose}</Typography>
        <Typography level="body-md">{gameMessages.messages[currentLevel]?.instruction}</Typography>
      </Card>
    </Stack>
  )
}

function WinScreen({ onRetry, currentLevel }) {
  return (
    <Stack spacing={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        userSelect: 'none',
      }}
    >
      <ConfettiExplosion particleCount={200} duration={4000} />

      <Card color="neutral" sx={{
        backgroundColor: 'rgba(22, 22, 22, 1)',
        p: 2,
        textAlign: 'center',
        color: "gray"
      }}>
        <Typography level="h2" color="success">Level behaald!</Typography>
        <Typography level="body-md">{gameMessages.messages[currentLevel]?.win}</Typography>
        <Typography level="body-md">{gameMessages.messages[currentLevel]?.instruction}</Typography>
      </Card>
    </Stack>
  );
}

function TimeRemaining({ timeRemaining, totalTimeInMilliseconds }) {
  let percentageLeft = timeRemaining / totalTimeInMilliseconds * 100

  return (
    <LinearProgress
      determinate
      color="neutral"
      thickness={32}
      value={Number(percentageLeft)}
      sx={{
        position: 'absolute',
        left: '0',
        bottom: '0',
        width: '100%',
        height: '32px',
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 20000,
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      <Typography
        level="body-xs"
        fontWeight="xl"
        textColor="common.white"
        sx={{ mixBlendMode: 'difference' }}
      >
        Tijd over: {`${String(Math.floor(timeRemaining / 60)).padStart(2, "0")}:${String(Math.floor(timeRemaining % 60)).padStart(2, "0")}`}
      </Typography>
    </LinearProgress >
  )
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <CircularProgress
        determinate
        soft="true"
        size="lg"
        color="neutral"
        value={progress}
      >
        {Math.trunc(progress)}%
      </CircularProgress>
    </Html>
  );
}

function HintPopup({ playerState, setPlayerState, currentLevel, setShowHintPopup }) {

  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const unlockedHints = playerState[`Level${currentLevel + 1}`]?.usedHints || 0

  const previous = () => {
    setCurrentHintIndex(prev => prev === 0 ? unlockedHints : prev - 1)
  }

  const next = () => {
    setCurrentHintIndex(prev => prev === (unlockedHints - 1) ? 0 : prev + 1)
  }

  const unlock = () => {
    if (unlockedHints !== 5) {
      setPlayerState(prev => {
        const level = { ...prev[`Level${currentLevel + 1}`], usedHints: (prev[`Level${currentLevel + 1}`]?.usedHints || 0) + 1 }
        return {
          ...prev, [`Level${currentLevel + 1}`]: level
        }
      })
    }
  }

  // load text from hints file
  const text = useMemo(() => {
    if (unlockedHints < 1)
      return <Typography level="title-md">
        Press unlock to unlock a hint.
      </Typography>

    return <Typography sx={{ whiteSpace: 'pre-line' }} level="title-md">
      {hints[currentLevel][currentHintIndex]}
    </Typography>
  }, [currentLevel, currentHintIndex, unlockedHints])

  return (
    <Card variant="outlined" sx={
      // Move to middle of screen
      {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '600px',
        transition: 'opacity 1s ease-in-out',
        zIndex: 100000,
        position: 'absolute',
      }}>
      <p>{text}</p>
      <ButtonGroup
        orientation="horizontal"
        size="sm"
        variant="soft">
        <Button onClick={previous} disabled={currentHintIndex === 0}>Previous</Button>
        <Button onClick={next} disabled={unlockedHints === 0 || currentHintIndex === (unlockedHints - 1)}>Next</Button>
        <Button onClick={unlock} disabled={unlockedHints >= 5}>Unlock Hint</Button>
      </ButtonGroup>
      <IconButton color="danger" onClick={() => setShowHintPopup(false)} size="sm" sx={{
        position: 'absolute',
        top: '0',
        right: '0',
        m: 1,
        mt: 0.4,
      }}>
        <Close />
      </IconButton>
    </ Card >
  );
}

const root = ReactDOM.createRoot(document.querySelector("#root"))
root.render(<App />)
