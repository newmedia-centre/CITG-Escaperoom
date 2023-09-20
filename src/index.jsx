// Index.jsx
import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import Level01 from "./Level01";
import Level02 from "./Level02";
import { Suspense, useRef, useState, useEffect } from "react";
import { CircularProgress, Typography, Button, ButtonGroup, IconButton } from "@mui/joy";
import { Stack, Box } from '@mui/material';
import { Physics, Debug } from "@react-three/cannon";
import ConfettiExplosion from "react-confetti-explosion";
import GaugeComponent from "react-gauge-component";
import Cylinder from "./shapes/Cylinder";
import Ring from "./shapes/Ring";
import Sphere from "./shapes/Sphere";
import { Leva } from "leva"

function App() {
  const cannonRef = useRef()
  const [fireCannon, setFireCannon] = useState(null)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [resetGame, setResetGame] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [speed, setSpeed] = useState(0)

  const rotateCannonUp = () => {
    if (cannonRef.current) {
      cannonRef.current.rotation.x += 0.1
    }
  }
  const rotateCannonDown = () => {
    if (cannonRef.current) {
      cannonRef.current.rotation.x -= 0.1
    }
  }
  const fireCannonBall = () => {
    if (fireCannon) {
      fireCannon()
    }
  }
  const retry = () => {
    setGameOver(false)
    setGameWon(false)
    setLives(3)
    setResetGame(true)
  }


  useEffect(() => {
    if (lives === 0) {
      setGameOver(true)
    }
  }, [lives])

  return (
    <>
      {!gameOver && !gameWon ? (
        <>
          {currentLevel === 0 && (
            <Stack direction="column" spacing={2} justifyContent="center"
              sx={{
                position: 'absolute',
                bottom: '0%',
                left: '50%',
                transform: 'translate(-50%, -20%)',
                userSelect: 'none'
              }}
              zIndex={10000}>
              <Button onClick={fireCannonBall} variant="solid" size="lg" color="danger">Fire!</Button>
              <Typography level="h6" color="neutral" variant="soft">Lives: {lives}</Typography>
            </Stack >
          )}
          {currentLevel === 1 && (
            <Stack direction="row" spacing={2} justifyContent="center"
              sx={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                userSelect: 'none'
              }}
              zIndex={10000}>
              <Box sx={{
                padding: 1,
                width: 240,
                borderRadius: 2,
                boxShadow: 2,
                backgroundColor: '#181c20',
              }}>
                <Typography level="title-lg" textColor="#8c92a4">Shapes</Typography>
                {/* ButtonGroup should be centered horizontally */}
                <ButtonGroup variant="soft" color="neutral" size="lg" spacing={2} style={{ justifyContent: "center" }}>
                  <IconButton><Cylinder /></IconButton>
                  <IconButton><Ring /></IconButton>
                  <IconButton><Sphere /></IconButton>
                </ButtonGroup>
              </Box>
              <Box
                sx={{
                  padding: 1,
                  width: 240,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: '#181c20',
                }}
              >
                <GaugeComponent
                  style={{ width: '100%' }}
                  type="semicircle"
                  value={speed}
                  minValue={0}
                  maxValue={2}
                  arc={{
                    width: 0.21,
                    padding: 0,
                    cornerRadius: 0,
                    subArcs: [
                      { limit: 0.5, color: '#EA4228', showTick: true },
                      { limit: 0.9, color: '#F5CD19', showTick: true },
                      { limit: 1.1, color: '#5BE12C', showTick: true },
                      { limit: 1.5, color: '#F5CD19', showTick: true },
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
                        style: { fontSize: 14 }
                      }
                    }
                  }}
                />
                <Typography level="h6" color="danger">Lives: {lives}</Typography>
              </Box>

            </Stack >
          )}
        </>
      ) : gameWon ? (
        <>
          <WinScreen onRetry={retry} />
        </>
      ) : (
        <GameOverScreen onRetry={retry} />
      )
      }

      <div
        style={{
          width: 350,
          position: "absolute",
          right: 0,
          top: 0,
          zIndex: 100,
          opacity: 0.8
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
              <Level02 setSpeed={setSpeed} lives={lives} setLives={setLives} setGameWon={setGameWon} gameWon={gameWon} gameOver={gameOver} setGameOver={setGameOver} resetGame={resetGame} setResetGame={setResetGame} />
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
      <Button onClick={onRetry} variant="solid" color="danger">Retry</Button>
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

      <Typography level="h2" color="success">You Win!</Typography>
      <Typography level="h3" color="success">New Keyword obtained:</Typography>
      <Typography level="h2" color="neutral" variant="soft">"Water"</Typography>
      <Button onClick={onRetry} variant="solid" size="lg" color="success">Retry</Button>
      <Typography level="body-lg" color="success" variant="soft" textAlign="center"
      >Remember your keywoard and continue to the next puzzle</Typography>
    </Stack>
  );
}

function Loader() {
  const { progress } = useProgress();
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