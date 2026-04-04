import { Button, Typography, Box } from "@mui/material";
import "../lib/PacmanCovid/styles/index.scss";
import PacmanCovid from "../lib/PacmanCovid";
import { gameRunningAtom, predictionAtom, modelAtom, imgSrcArrAtom } from "../GlobalState";
import { useAtom } from "jotai";

export default function PacMan() {
    const [isRunning, setIsRuning] = useAtom(gameRunningAtom);
    const [predictionDirection] = useAtom(predictionAtom);
    const [model] = useAtom(modelAtom);
    const [imgSrcArr] = useAtom(imgSrcArrAtom);
    
    // Count how many examples per class
    const classCounts = ['up', 'down', 'left', 'right'].map(
        dir => imgSrcArr.filter(img => img.label === dir).length
    );

    // Get min and max counts
    const minExamples = Math.min(...classCounts);
    const maxExamples = Math.max(...classCounts);

    // Condition in order to start playing the game
    const hasEnoughData = minExamples >= 8;
    const isImbalanced = maxExamples > minExamples * 3 && minExamples > 0;
    const canPlay = model !== null && hasEnoughData;

    const pacManProps = {
        gridSize: 17,
        animate: process.env.NODE_ENV !== "development",
        locale: "pt",
        onEnd: () => {
            console.log("onEnd");
        },
    };

    return (
        <>
            <PacmanCovid
                {...pacManProps}
                isRunning={isRunning}
                setIsRuning={setIsRuning}
                predictions={predictionDirection}
            />

            {/* STOP GAME button — only visible WHILE game is running */}
            {isRunning && (
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => setIsRuning(false)}
                    fullWidth
                    sx={{ mt: 1 }}
                >
                    ⬛ Stop Game
                </Button>
            )}

            {/* START section — only visible when game is NOT running */}
            {!isRunning && (
                <>
                    {/* Class imbalance warning */}
                    {isImbalanced && (
                        <Box sx={{
                            p: 1,
                            mt: 1,
                            mb: 1,
                            backgroundColor: '#fff3e0',
                            border: '1px solid #ff9800',
                            borderRadius: 1,
                            textAlign: 'center',
                        }}>
                            <Typography variant="body2" color="warning.main" fontWeight="bold">
                                ⚠ Class imbalance: {['Up', 'Down', 'Left', 'Right'].map((name, i) =>
                                    `${name}: ${classCounts[i]}`).join(', ')}
                            </Typography>
                        </Box>
                    )}

                    {/* Start Game button */}
                    <Button
                        variant="contained"
                        onClick={() => setIsRuning(true)}
                        disabled={!canPlay}
                        fullWidth
                    >
                        {model === null
                            ? "Train the model first"
                            : !hasEnoughData
                            ? `Add more examples (min 8 per class)`
                            : "Start Game"}
                    </Button>

                    {/* Visible warning when button is disabled */}
                    {!canPlay && (
                        <Box sx={{
                            p: 1,
                            mt: 1,
                            backgroundColor: '#ffebee',
                            border: '1px solid #f44336',
                            borderRadius: 1,
                            textAlign: 'center',
                        }}>
                            <Typography variant="body2" color="error" fontWeight="bold">
                                {model === null
                                    ? "⚠ Please train the model before playing"
                                    : `⚠ Need at least 8 examples per class. Current: ${['Up', 'Down', 'Left', 'Right'].map((name, i) =>
                                        `${name}: ${classCounts[i]}`).join(', ')}`
                                }
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </>
    );
}