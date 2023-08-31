// Index.jsx
import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import Level01 from "./Level01";
import Level02 from "./Level02";
import { Suspense, useRef, useState, useEffect } from "react";
import { CircularProgress } from "@mui/joy";
import { Stack, Box, Button, Typography } from '@mui/material';
import { Physics, Debug } from "@react-three/cannon";
import ConfettiExplosion from "react-confetti-explosion";
import GaugeComponent from "react-gauge-component";


function App() {
  const cannonRef = useRef()
  const [fireCannon, setFireCannon] = useState(null)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [resetGame, setResetGame] = useState(false)
  const [isExploding, setIsExploding] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
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
              <Button onClick={fireCannonBall} variant="contained" color="error">Fire!</Button>
              <Typography variant="h6" color="error">Lives: {lives}</Typography>
            </Stack >
          )}
          {currentLevel === 1 && (
            <Stack direction="column" justifyContent="center"
              sx={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                userSelect: 'none'
              }}
              zIndex={10000}>
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
                <Typography variant="h6" color="error">Lives: {lives}</Typography>
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

      <Canvas
        dpr={[1, 1.5]}
        shadows
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true }}
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
    <Box
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
      <Typography variant="h2" color="error">Game Over</Typography>
      <Button onClick={onRetry} variant="contained" color="error">Retry</Button>
    </Box>
  );
}

function WinScreen({ onRetry }) {
  return (
    <Box
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
      <ConfettiExplosion particleCount={200} duration={4000} />

      <Typography variant="h2" color="green">You Win!</Typography>
      <Button onClick={onRetry} variant="contained" color="success">Retry</Button>
    </Box>
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