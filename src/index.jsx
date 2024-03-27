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
import { CircularProgress, Typography, Button, IconButton, ButtonGroup, LinearProgress, Card, Select, Option } from "@mui/joy";
import { QuestionMark, Close } from "@mui/icons-material";
import { Stack } from '@mui/material';
import { Physics, Debug } from "@react-three/cannon";
import ConfettiExplosion from "react-confetti-explosion";
import GaugeComponent from "react-gauge-component";
import { Leva } from "leva"
import DatabaseClient from "./DatabaseClient"
import hints from './hints'
import gameMessages from "./game-messages"
import WelcomeScreen from "./WelcomeScreen"

function App() {
  const cannonRef = useRef()
  const [fireCannon, setFireCannon] = useState(null)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [resetGame, setResetGame] = useState(false)
  const [showHintPopup, setShowHintPopup] = useState(false)
  const [geoLock, setGeoLock] = useState(false)
  const [speed, setSpeed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(5400)
  const [playerID, setPlayerID] = useState(localStorage.getItem('player') ?? '')
  const [playerState, setPlayerState] = useState()
  const [playerIDInput, setPlayerIDInput] = useState('')
  const [animationProgress, setAnimationProgress] = useState(0)
  const [welcomeScreen, setWelcomeScreen] = useState(true)
  const [level4Force, setLevel4Force] = useState(700)

  const level4ForceOptions = [
    700,
    800,
    900,
    1000
  ]

  const level03Ref = useRef()
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
        return null;
    }
  }, [window.location.search])

  useEffect(() => {
    if (lives === 3) return

    if (lives === 0) {
      setGameOver(true)
      setPlayerState(prev => ({ ...prev, [`Level${currentLevel + 1}`]: { ...prev[`Level${currentLevel + 1}`], lives, Lost: true, Penalty: 100, EndTime: Date.now() } }))
      return
    }
    setPlayerState(prev => ({ ...prev, [`Level${currentLevel + 1}`]: { ...prev[`Level${currentLevel + 1}`], lives } }))
  }, [lives, currentLevel])

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
    if (fireCannon !== null) {
      fireCannon()
    }
  }

  const handleActivateClick = () => {
    level03Ref.current.activatePulley()
  }

  const handleResetClick = () => {
    level03Ref.current.resetLevel()
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

  // Give up level
  const giveUpLevel = () => {
    setGameOver(true)

    setPlayerState(prev => ({ ...prev, [`Level${currentLevel + 1}`]: { ...prev[`Level${currentLevel + 1}`], lives: 0, Lost: true, Penalty: 100, EndTime: Date.now() } }))
    return
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
      setPlayerState(state === undefined ? null : (state[`Level${currentLevel + 1}`] ? state : { ...state, [`Level${currentLevel + 1}`]: { StartTime: Date.now(), lives: 3, usedHints: 0 } }))

      if (state && state[`Level${currentLevel + 1}`]?.Won) {
        setGameWon(true)
      }

      if (state && state[`Level${currentLevel + 1}`]?.Lost) {
        setGameOver(true)
      }

      setLives(() => {
        if (!state) return 3
        if (!state[`Level${currentLevel + 1}`]) return 3
        return state[`Level${currentLevel + 1}`].lives ?? 3
      })
    }

    // check geolocation
    const skipGeo = new URLSearchParams(window.location.search).get('skipgeo')
    if (!skipGeo) {
      navigator.geolocation.getCurrentPosition(pos => {
        const citgLat = 51.999
        const citgLon = 4.376

        if ((Math.abs(citgLat - pos.coords.latitude) < 0.002) && (Math.abs(citgLon - pos.coords.longitude) < 0.002)) {
          setGeoLock(false)
        } else {
          setGeoLock(true)
        }

      }, e => {
        console.error(e)
        setGeoLock(true)
      }, {
        timeout: 10000,
        maximumAge: 0
      })
    }

    get()
  }, [playerID, currentLevel])

  useEffect(() => {
    if (!playerState) return

    // If player has won set won to true
    if (gameWon && !playerState?.Won && !playerState?.Lost) {
      setPlayerState(prev => {
        const hintPenalty = (() => {
          if (!prev[`Level${currentLevel + 1}`].usedHints) return 0
          return prev[`Level${currentLevel + 1}`].usedHints * 10
        })()
        const livePenalty = (() => {
          if (!prev[`Level${currentLevel + 1}`].lives) return 0
          return (3 - prev[`Level${currentLevel + 1}`].lives) * 20
        })()
        return { ...prev, [`Level${currentLevel + 1}`]: { ...prev[`Level${currentLevel + 1}`], EndTime: Date.now(), Won: true, Penalty: hintPenalty + livePenalty } }
      })
    }
  }, [gameWon, currentLevel])

  // handle all games won or lost or finished
  useEffect(() => {
    if (playerState?.Finished) return

    if (
      (playerState?.Level1?.Lost || playerState?.Level1?.Won) &&
      (playerState?.Level2?.Lost || playerState?.Level2?.Won) &&
      (playerState?.Level3?.Lost || playerState?.Level3?.Won) &&
      (playerState?.Level4?.Lost || playerState?.Level4?.Won)) {
      setPlayerState(prev => ({
        ...prev,
        Finished: true,
        EndTime: Date.now(),
        Penalty: (playerState?.Level1?.Penalty ?? 100) + (playerState?.Level2?.Penalty ?? 100) + (playerState?.Level3?.Penalty ?? 100) + (playerState?.Level4?.Penalty ?? 100)
      }))
      return
    }
  }, [playerState])

  // Game over when time runs out
  useEffect(() => {
    if (!playerState) return
    if (playerState.Won || playerState.Lost || playerState.Finished) return

    if (playerState.StartTime + totalTimeInMilliseconds < Date.now()) {
      setGameOver(true)
      setPlayerState(prev => ({
        ...prev,
        EndTime: prev.StartTime + totalTimeInMilliseconds,
        Finished: true,
        Penalty: (playerState?.Level1?.Penalty ?? 100) + (playerState?.Level2?.Penalty ?? 100) + (playerState?.Level3?.Penalty ?? 100) + (playerState?.Level4?.Penalty ?? 100)
      }))
    }
  }, [playerState])

  // Update database on state change
  useEffect(() => {
    const update = async () => {
      const token = await DatabaseClient.auth()
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

  if (playerState?.Finished) return (
    <FinishedWinScreen penalty={playerState.Penalty} playerID={playerID} />
  )

  // clear playerstate with the clear url
  const clear = new URLSearchParams(window.location.search).get('clear')
  if (clear) {
    console.log('should clear')
    localStorage.removeItem('player')
    window.location.href = '/'
  }

  // show locked screen when levels are loaded in wrong order
  switch (currentLevel) {
    case null: {
      return (
        <WelcomeScreen onSubmit={onSubmit} setPlayerIDInput={setPlayerIDInput} playerIDInput={playerIDInput} registerPlayer={playerState ? null : registerPlayer} />
      )
    }
    case 1: // Puzzle piece level
      if (!playerState?.Level1) {
        return (
          <LockedScreen text='Je moet eerst het vorige level afronden voordat je dit level kunt spelen' />
        )
      }
      break;
    case 2: // Pulley level
      if (!playerState?.Level1 || !playerState?.Level2) {
        return (
          <LockedScreen text='Je moet eerst het vorige level afronden voordat je dit level kunt spelen' />
        )
      }
      break;
    case 3: // Boat level
      if (!playerState?.Level1 || !playerState?.Level2 || !playerState?.Level3) {
        return (
          <LockedScreen text='Je moet eerst het vorige level afronden voordat je dit level kunt spelen' />
        )
      }
      break;
  }

  if (geoLock) {
    return (
      <LockedScreen text='Je moet je op de juiste locatie bevinden om dit level te kunnen spelen' />
    )
  }

  return (
    <>
      {/* If player name is not found register new Player */}
      {playerState === null && (
        <>
          <WelcomeScreen onSubmit={onSubmit} setPlayerIDInput={setPlayerIDInput} playerIDInput={playerIDInput} registerPlayer={registerPlayer} />
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
              userSelect: 'none',
            }}>
              <Card sx={{
                padding: '8px',
                position: 'absolute',
                bottom: '38px',
                right: '302px',
                pr: 1.4,
              }}>
                <Typography>Pogingen: {lives}</Typography>
              </Card>
              <Card sx={{
                padding: '8px',
                position: 'absolute',
                bottom: '38px',
                right: '202px',
                pr: 1.4,
              }}>
                <Typography>Penalty: {(3 - lives) * 20 + (playerState && playerState[`Level${currentLevel + 1}`]?.usedHints || 0) * 10}</Typography>
              </Card>
              <IconButton variant="solid" color="warning" aria-label="Open in new tab" onClick={() => setShowHintPopup(!showHintPopup)}
                sx={{
                  position: 'absolute',
                  bottom: '38px',
                  right: '112px',
                  pr: 1.4,
                  userSelect: 'none',
                }}>
                <QuestionMark />
                Hints
              </IconButton>
              <IconButton variant="solid" color="danger" aria-label="Skip to the next level" onClick={() => giveUpLevel()}
                sx={{
                  position: 'absolute',
                  bottom: '38px',
                  right: '20px',
                  px: 1.4,
                  userSelect: 'none',
                }}>
                Give Up
              </IconButton>
              <TimeRemaining timeRemaining={timeRemaining} totalTimeInMilliseconds={totalTimeInMilliseconds} />
            </Stack>


            {currentLevel === 0 && (
              <>
                {welcomeScreen &&
                  <Card variant="outlined" sx={
                    // Move to middle of screen
                    {
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80%',
                      maxWidth: '600px',
                      transition: 'opacity 1s ease-in-out',
                      zIndex: 10000,
                      position: 'absolute',
                    }}>
                    <Typography level="title-md" sx={{ textAlign: 'center', mb: 1 }}>
                      Welkom bij Kanon level
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 1 }}>
                      Vuur de kanonskogel af en raak de rode knop om de Maeslantkering te sluiten.
                    </Typography>

                    <IconButton onClick={() => setWelcomeScreen(false)} color="danger" size="sm" sx={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      m: 1,
                      mt: 0.4,
                    }}>
                      <Close />
                    </IconButton>
                  </ Card >
                }
                <Stack direction="row" spacing={3} justifyContent="center"
                  sx={{
                    position: 'absolute',
                    bottom: '32px',
                    left: '50px',
                    transform: 'translate(-50%, -20%)',
                    userSelect: 'none',
                  }}
                  zIndex={10000}>
                  <Button onClick={fireCannonBall} variant="solid" size="lg" color="danger">Vuur!</Button>
                </Stack >
              </>
            )}
            {currentLevel === 1 && (
              <>
                {welcomeScreen &&
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
                    <Typography level="title-md" sx={{ textAlign: 'center', mb: 1 }}>
                      Welkom bij OR puzzel
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 1 }}>
                      Vind het OR van de blauwe staaf in elk van de vier stukken om de Oosterscheldekering te sluiten.
                    </Typography>

                    <IconButton onClick={() => setWelcomeScreen(false)} color="danger" size="sm" sx={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      m: 1,
                      mt: 0.4,
                    }}>
                      <Close />
                    </IconButton>
                  </ Card >
                }
              </>
            )}
            {currentLevel === 2 && (
              <>
                {welcomeScreen &&
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
                    <Typography level="title-md" sx={{ textAlign: 'center', mb: 1 }}>
                      Welkom bij Cabinet puzzel!
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 1 }}>
                      Kies een van de objecten uit de kast en activeer het mechanisme om de Hollandsche IJsselkering te sluiten.
                    </Typography>

                    <IconButton onClick={() => setWelcomeScreen(false)} color="danger" size="sm" sx={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      m: 1,
                      mt: 0.4,
                    }}>
                      <Close />
                    </IconButton>
                  </ Card >
                }
                <Stack direction="row" spacing={1} flexWrap={"wrap"} useFlexGap sx={{
                  position: 'absolute',
                  bottom: '94px',
                  left: '12px',
                  zIndex: 10000,
                }}>
                  {/* Left Panel */}
                  <Stack spacing={1} p={2}
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      opacity: 0.95,
                      backgroundColor: '#181c20',
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
                      borderRadius: 2,
                      boxShadow: 2,
                      opacity: 0.95,
                      backgroundColor: '#181c20',
                    }}
                  >
                    <GaugeComponent
                      style={{
                        width: '220px',
                      }}
                      type="semicircle"
                      value={speed}
                      minValue={0}
                      maxValue={3}
                      arc={{
                        width: 0.22,
                        padding: 0,
                        cornerRadius: 0,
                        subArcs: [
                          { limit: 0.5, color: '#EA4228', showTick: true },
                          { limit: 0.95, color: '#F5CD19', showTick: true },
                          { limit: 1.05, color: '#5BE12C', showTick: true },
                          { limit: 1.5, color: '#F5CD19', showTick: true },
                          { color: '#EA4228' }
                        ]
                      }}
                      pointer={{
                        color: 'gray',
                        length: 0.80,
                        width: 14,
                        elastic: true,
                        animationDuration: 1000,
                      }}
                      labels={{
                        valueLabel: { formatTextValue: value => value + ' m/s²' },
                        tickLabels: {
                          defaultTickValueConfig: {
                            style: { fontSize: 12 },
                          },

                        }
                      }}
                    />
                    <Typography level="body-md" textColor="white" sx={{ textAlign: 'center' }}>Acceleratie</Typography>
                  </Stack >
                </Stack>

              </>
            )}
            {currentLevel === 3 && (
              <>
                {/* Only render when welcomescreen is true */}
                {welcomeScreen &&
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
                    <Typography level="title-md" sx={{ textAlign: 'center', mb: 1 }}>
                      Welkom bij de laatste puzzel!
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 1 }}>
                      Kies het vloertype en de duwkracht om uit het gebouw te ontsnappen met de gewenste acceleratie.
                    </Typography>

                    <IconButton onClick={() => setWelcomeScreen(false)} color="danger" size="sm" sx={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      m: 1,
                      mt: 0.4,
                    }}>
                      <Close />
                    </IconButton>
                  </ Card >
                }
                <Stack direction="row" spacing={1} flexWrap={"wrap"} useFlexGap sx={{
                  position: 'absolute',
                  m: 1,
                  bottom: '32px',
                  left: '0',
                  zIndex: 10000,
                }}>
                  <Select value={level4Force} onChange={(e, value) => setLevel4Force(value)} >
                    {level4ForceOptions.map(option => (
                      <Option key={option} value={option}>
                        Duwkracht: {option}N
                      </Option>
                    ))}
                  </Select>
                  <Button onClick={() => level04Ref.current.play()}>Duw boot</Button>
                </Stack>
              </>
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
             <Debug> 
            {currentLevel === 0 && (
              <Level01 cannonRef={cannonRef} setFireFunction={setFireCannon} lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} resetGame={resetGame} setResetGame={setResetGame} />
            )}
            {currentLevel === 1 && (
              <Level03
                lives={lives}
                setLives={setLives}
                setGameWon={setGameWon}
                gameWon={gameWon}
                gameOver={gameOver}
                setGameOver={setGameOver} resetGame={resetGame} setResetGame={setResetGame}

              />
            )}
            {currentLevel === 2 && (
              <Level02
                ref={level03Ref} lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} setResetGame={setResetGame} resetGame={resetGame} animationProgress={animationProgress}
                setAnimationProgress={setAnimationProgress}
                speed={speed}
                setSpeed={setSpeed} />
            )}
            {currentLevel === 3 && (
              <Level04 ref={level04Ref} force={level4Force} lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} setResetGame={setResetGame} resetGame={resetGame} />
            )}

             </Debug> 
          </Physics>
        </Suspense>
      </Canvas>
      <div id="info-box">
        <div id="comment" style={{ userSelect: "none" }}>
          <div style={{ marginBottom: 4 }}>
            Built by — <img src="/xrzone-16x16.png" /> Zone
          </div>
          <img src="tudelft-nmc-200px.png" />
        </div>
      </div>

    </>
  )
}

function LockedScreen({ text }) {
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
        <Typography level="h2" color="danger">Level niet beschikbaar</Typography>
        <Typography level="body-md">{text}</Typography>
      </Card>
    </Stack>
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
        <Typography level="h2" color="danger">Geen pogingen over</Typography>
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

function FinishedWinScreen({ penalty, won, playerID }) {

  const [leaderboard, setLeaderboard] = useState([])
  const [playerIndex, setPlayerIndex] = useState(0)

  useEffect(() => {
    const get = async () => {
      // get the leaderboard
      const token = await DatabaseClient.auth().catch(e => console.error(e))
      const data = await DatabaseClient.leaderboard(token)

      // sort data
      data.sort((a, b) => a.Penalty - b.Penalty || (a.EndTime - a.StartTime) - (b.EndTime - b.StartTime))

      // get player
      const playerIndex = data.findIndex(x => x.id === playerID)
      const player = data[playerIndex]

      // shrink to top 10 only
      data.splice(10)

      if (!data.includes(player)) {
        data.push(player)
      }

      setLeaderboard(data)
      setPlayerIndex(playerIndex)
    }

    get()
  }, [playerID])

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
      <ConfettiExplosion particleCount={400 - penalty} duration={4000} />
      <Card color="neutral" sx={{
        backgroundColor: 'rgba(22, 22, 22, 1)',
        p: 2,
        textAlign: 'center',
        color: "gray"
      }}>
        <Typography level="h3" color="white">Gefeliciteerd, geweldige civieltechnische helden! Jullie hebben het onmogelijke gedaan en met succes de Deltawerken gesloten, waardoor een catastrofe werd afgewend en talloze levens werden gered. Jullie teamwork, doorzettingsvermogen en begrip van dynamica hebben het verschil gemaakt.</Typography>
        <Typography level="h3" color="white">Jullie hebben als team {400 - penalty} punten en staan daarmee voorlopig op plaats {playerIndex + 1}.</Typography>
      </Card>
      <Card color="neutral" sx={{
        backgroundColor: 'rgba(22, 22, 22, 1)',
        px: 2,
        textAlign: 'center',
        color: "gray",
        width: '90vw',
        margin: '16px',
      }}>
        <table style={{ width: "90vw", tableLayout: "fixed" }}>
          <thead style={{ color: '#fff' }}>
            <tr>
              <th align="left">#</th>
              <th align="left">Team</th>
              <th align="right">Score</th>
              <th align="right">Tijd</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, index) => (
              <tr key={index} style={{ color: row.id === playerID ? 'white' : 'gray', height: "1em" }}>
                <td align="left">{row.id === playerID ? playerIndex + 1 : index + 1}</td>
                <td align="left" style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{row.id}</td>
                <td align="right">{400 - row.Penalty}</td>
                <td align="right">{`${String(Math.floor(((row.EndTime - row.StartTime) / 1000) / 60)).padStart(2, "0")}:${String(Math.floor(((row.EndTime - row.StartTime) / 1000) % 60)).padStart(2, "0")}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    setCurrentHintIndex(prev => prev === (unlockedHints - 1) ? prev : prev + 1)
  }

  const unlock = () => {
    if (unlockedHints !== 5) {
      setPlayerState(prev => {
        const level = { ...prev[`Level${currentLevel + 1}`], usedHints: (prev[`Level${currentLevel + 1}`]?.usedHints || 0) + 1 }
        return {
          ...prev, [`Level${currentLevel + 1}`]: level
        }
      })
      setCurrentHintIndex(unlockedHints)
    }
  }

  // load text from hints file
  const text = useMemo(() => {
    if (unlockedHints < 1)
      return <Typography level="title-md">
        Druk op de knop 'Nieuwe Hint' om een hint te verkrijgen.
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
        <Button onClick={previous} disabled={currentHintIndex === 0}>Vorige</Button>
        <Button onClick={next} disabled={unlockedHints === 0 || currentHintIndex === (unlockedHints - 1)}>Volgende</Button>
        <Button onClick={unlock} disabled={unlockedHints > 4}>Nieuwe Hint</Button>
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
