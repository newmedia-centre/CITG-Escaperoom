// Index.jsx
import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import Level01 from "./Level01"
import Level02 from "./Level02"
import Level03 from "./Level03"
import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { CircularProgress, Typography, Button, LinearProgress, Input } from "@mui/joy";
import { Stack } from '@mui/material';
import { Physics, Debug } from "@react-three/cannon";
import ConfettiExplosion from "react-confetti-explosion";
import GaugeComponent from "react-gauge-component";
import { Leva } from "leva"
import DatabaseClient from "./DatabaseClient"

function App() {
  const cannonRef = useRef()
  const [fireCannon, setFireCannon] = useState(null)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [resetGame, setResetGame] = useState(false)
  const [speed, setSpeed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(5400)
  const [playerID, setPlayerID] = useState(localStorage.getItem('player') ?? '')
  const [playerState, setPlayerState] = useState()
  const [playerIDInput, setPlayerIDInput] = useState('')
  const [animationProgress, setAnimationProgress] = useState(0)

  const level02Ref = useRef()
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
      default:
        return 0;
    }
  }, [window.location.search])

  // Adds player to database and starts the game
  const registerPlayer = async () => {
    if (!playerIDInput) return

    // store player in localStorage and state
    localStorage.setItem('player', playerIDInput)
    setPlayerID(playerIDInput)

    // check to see if player exists
    const token = await DatabaseClient.auth()
    const existing = await DatabaseClient.read(playerIDInput, token)

    // create player if it doesnt exist
    if (!existing) {
      await DatabaseClient.add(playerIDInput, { StartTime: Date.now() }, token)
    }
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

  const postStartGameTime = async (playerName) => {
    const token = await fetchAuthToken()
    const date = Date.now()
    let dateUnix = Math.round(date / 1000)
  }

  // To prevent page refresh on form submit
  const onSubmit = (e) => {
    e.preventDefault()
  }

  // Get player state from database
  useEffect(() => {
    const get = async () => {
      const token = await DatabaseClient.auth().catch(() => setPlayerState(null))
      const state = await DatabaseClient.read(playerID, token).catch(() => setPlayerState(null))
      setPlayerState(state ?? null)
    }

    get()
  }, [playerID])

  // Game over when time runs out
  useEffect(() => {
    if (!playerState) return

    if (playerState.StartTime + totalTimeInMilliseconds < Date.now()) {
      setGameOver(true)
      setPlayerState(prev => ({ ...prev, EndTime: prev.StartTime + totalTimeInMilliseconds, Lost: true }))
    }
  }, [playerState])

  // Update database on game won or game over
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
              backgroundColor: "rgba(0,0,0,0.34)",
              userSelect: "none",
              zIndex: 90000,
            }}
          >
            <Typography level="h1">Welcome to</Typography>
            <Typography level="h2">CITG Escape Room</Typography>
            <Typography level="body-md">Create your group name to play the game</Typography>
            <form onSubmit={onSubmit} >
              <Stack spacing={1}>
                <Input placeholder="Enter your group name..." variant="solid" required value={playerIDInput} onChange={e => setPlayerIDInput(e.target.value)} />
                <Button type={"submit"} onClick={registerPlayer} size="lg">Play</Button>
              </Stack>
            </form>
          </Stack>
        </>
      )
      }

      {!gameOver && !gameWon ? (
        <>
          <TimeRemaining timeRemaining={timeRemaining} totalTimeInMilliseconds={totalTimeInMilliseconds} />

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
        </>
      ) : gameWon ? ( // If game is won show win screen
        <>
          <WinScreen onRetry={retry} />
        </>
      ) : ( // If game is lost show game over screen
        <GameOverScreen onRetry={retry} />
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

function GameOverScreen({ onRetry }) {
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
      <Typography level="h2" color="danger">Game Over</Typography>
      <Button onClick={onRetry} variant="solid" color="danger">Opnieuw proberen</Button>
    </Stack>
  )
}

function WinScreen({ onRetry }) {
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

      <Typography level="h2" color="success">Level completed!</Typography>
      <Button onClick={onRetry} variant="solid" size="lg" color="success">Openiuw proberen</Button>
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

const root = ReactDOM.createRoot(document.querySelector("#root"))
root.render(<App />)