import { Button, Typography } from "@mui/material";
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
    const canPlay = model != null && hasEnoughData;

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
            {!isRunning && (
                <>
                    {isImbalanced &&(
                        <Typography variant="caption" color="warning.main" sx = {{ display: 'block', mb: 1, textAlign: 'center'}}>
                            ⚠ Class imbalance: {['Up','Down','Left','Right'].map((name, i) =>
                            `${name}: ${classCounts[i]}`).join(', ')}
                        </Typography>
                    )}
                    <Button 
                        variant="contained"
                        onClick={() => setIsRuning(!isRunning)}
                        disabled={!canPlay}
                    >
                        {model === null
                            ? "Train the model first"
                            : !hasEnoughData
                            ? `Add more examples (min 8 per class)`
                            : "Start Game"}
                    </Button>
                </>
            )}
        </>
    );
}
