import {useAtom} from "jotai";
import { confidenceStatusAtom, confidenceThresholdAtom } from "../GlobalState";
import {Box, Typography} from "@mui/material";
import { BoySharp } from "@mui/icons-material";

export default function ConfidenceDisplay() {
    const [status] = useAtom(confidenceStatusAtom);
    const [threshold] = useAtom(confidenceThresholdAtom);

    // if no predictions yet then show nothing
    if(status.predictedClass == -1) 
        return null;

    const isConfident = status.isAboveThreshold;
    const confidencePercent = Math.round(status.confidence*100);

    return(
        /* Outer Box - Colour element gets added to the background of the box
           according to the confidence level, which will later hold the filled bar*/
        <Box
            sx = {{
                    p: 1.5,
                    mt : 1,
                    mb : 1,
                    borderRadius: 1,
                    border : `2px solid $(isConfident ? '#4caf50' : '#ff9800')`,
                    backgroundColor : isConfident ? '#e8f5e9' : '#fff3e0',
                    textAlign : 'center',
            }}
        >
            <Typography variant = "body1" fontWeight= "bold">
                {isConfident ? '✓' : '⚠'} Predicted: {status.predictedClassName?.toUpperCase() || '-'}
                {' '}({confidencePercent}%)
            </Typography>

            {/* Confidence bar */}
            
            {/* Initially we created a grey bar present which gets filled according to the confidence % */}
            <Box sx = {{
                        mt: 0.5,
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        borderRadius: 1,
                        height: 12                                  // Outer Box - height
            }}>
                /* Inner box - we are filling the bar (filed bar according to the confidence %) 
                   AND changing the color (Red or Orange) of the filled bar wrt the confidence */
                <Box 
                    sx = {{
                        width: `${confidencePercent}%`,
                        backgroundColor: isConfident ? '#4caf50' : '#ff9800',
                        height: '100%',                             // Match the outerBox height
                        borderRadius: 1,
                        transition: 'width 0.2s ease',              //When width changes animate
                    }}
                />
                </Box>

                <Typography variant="caption" color = "text.secondary">
                    {isConfident
                        ? 'Confident - Pac-Man is moving'
                        : `Below ${math.round(threshold*100)}% threshold - Pac-Man paused`
                    }
                </Typography>

                {/* Per-class confidence breakdown */}
                {status.probabilities &&(
                    <Box sx = {{
                            display: 'flex',
                            justifyContent: 'space-around',
                            mt: 1
                     }}>

                        {['Up', 'Down', 'Left', 'Right'].map((name, i) => (
                            <Typography
                                key = {name}
                                variant="caption"
                                sx = {{
                                        fontWeight: i === status.predictedClass ? 'bold' : 'normal',
                                        color: i === status.predictedClass ? '#1976d2' : 'text.secondary',
                                }}
                            >
                                {name}: {Math.round(status.probabilities*100)}%
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
}
 



