import { useAtom } from "jotai";
import { predictionResultsAtom } from "../GlobalState";
import { Box, Typography, Button, Chip} from "@mui/material";
import { useState } from "react";  
  // useState() takes an argument that serves as the starting value of the state variable
  // - useState hook is a function that returns a array containing 
  // state variable as well as a function to update the value of that state variable

const CLASS_NAMES = ['up', 'down', 'left', 'right'];
const CLASS_COLORS = ['#2196f3', '#ff9800', '#4caf50', '#f03efa'];

export default function PredictionMatrix(){
    const [results] = useAtom(predictionResultsAtom);
    const [sortBy, setSortBy] = useState('default');      // 'default' | 'confidence'
    const [filterClass, setFilterClass] = useState('all'); // // 'all' | 'up' | 'down' | 'left' | 'right'

    // We don't render if there aren't any results
    if(!results || results.length === 0)
        return null;

    // let's apply filter - filter creates a new array containing elements that pass a test.
    let displayResults = filterClass === 'all'
        ? [...results]
        : results.filter(r => r.trueLabel === filterClass);  //show only matching class

    if(sortBy === 'confidence'){
        displayResults.sort((a, b) => a.confidence - b.confidence);  // lowest confidence first
    }    

    // let's calculate summary stats
    const totalCorrect = results.filter(r => r.correct).length;
    const accuracy = ((totalCorrect / results.length)*100).toFixed(1);    // .toFixed(1) rounds and gives upto one decimal place and returns a STRING, not a number.

    // Per-class accuracy
    const classAccuracies = CLASS_NAMES.map(cls =>{
        const classExamples = results.filter(r => r.trueLabel === cls);
        const classCorrect = classExamples.filter(r => r.correct).length;
        return{
            name: cls,
            total: classExamples.length,
            correct: classCorrect,
            accuracy: classExamples.length > 0
                ? ((classCorrect / classExamples.length)*100).toFixed(0)
                : 'N/A'
        };

    });

    const worstClass = classAccuracies
        .filter(c => c.total > 0)   // remove classes with zero examples
        .sort((a,b) => parseFloat(a.accuracy) - parseFloat(b.accuracy))[0];  // convert string -> number, then sort by ascending order and take the first element

    return (
        <Box sx = {{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: '#fafafa'
        }}>

            <Typography variant="h6" gutterBottom>
                Training Data Analysis
            </Typography>

            {/* Summary row */}
            <Box sx = {{
                display: 'flex',
                gap: 2,
                mb:2,
                flexWrap: 'wrap'
            }}>

                <Chip
                    label = {`Overall: ${totalCorrect}/${results.length} correct (${accuracy}%)`}
                    color={parseFloat(accuracy) > 80 ? 'success' : parseFloat(accuracy) > 60 ? 'warning' : 'error'}
                />
                {worstClass && (
                    <Chip
                        label ={ `Weakest: ${worstClass.name.toUpperCase()} (${worstClass.accuracy}%)`}
                        color ='warning'
                        variant="outlined"
                    />
                )}
            </Box>    

            {/* Controls */}

            <Box sx = {{
                display: 'flex',
                gap: 1,
                mb: 2,
                flexWrap: 'wrap'
            }}>
                <Button
                    size="small"
                    variant={sortBy === 'default' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('default')}
                >
                    Default Order
                </Button>
                <Button
                    size="small"
                    variant = {sortBy === 'confidence' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('confidence')}
                >
                    Sort by Confidence ↑
                </Button>
                <Box sx = {{mb: 1, borderleft: '1px solid #ccc' }} />
                <Button
                    size ="small"
                    variant={filterClass === 'all' ? 'contained' : 'outlined'}
                    onClick={() => setFilterClass('all')}
                >
                    All
                </Button>
                {CLASS_NAMES.map(cls =>(
                    <Button
                        key={cls}
                        size="small"
                        variant={filterClass === cls ? 'contained': 'outlined'}
                        onClick={() => setFilterClass(cls)}
                    >
                        {cls.toUpperCase()} ({classAccuracies.find(c => c.name === cls)?.total || 0})
                    </Button>
                ))}
            </Box>

            {/* Results table */}
            <Box sx ={{ maxHeight: '400px', overflowY: 'auto'}}>     
                {/* header row */}
                <Box sx ={{display: 'flex', alignItems: 'center', p: 0.5, borderBottom: '2px solid #ccc', postion: 'sticky', top: 0, backgroundColor: '#fafafa', zIndex: 1 }}>
                    <Box sx = {{ width: 70, flexShrink: 0, fontSize: 12, fontWeight: 'bold'}}>Image</Box>
                    <Box sx = {{ width: 60, flexShrink: 0, fontSize: 12, fontWeight: 'bold' }}>Label</Box>
                    {CLASS_NAMES.map(cls => (
                        <Box key = {cls} sx = {{ flex:1, fontSize: 12, fontWeight: 'bold', textAlign: 'center'}}>
                            {cls.toUpperCase()}
                        </Box>    
                    ))}
                    <Box sx ={{ width:40, flexShrink: 0, fontSize: 12, fontWeight: 'bold', textAlign: 'center'}}>OK?</Box>
                </Box>

                {/* Data rows */}
                {displayResults.map((result, index) => (
                    <PredictionRow key = {index} result = {result} />
                ))}
            </Box>
        </Box>
    );
}


function PredictionRow({result}){
    const [isHovered, setIsHovered] = useState(false);

    return(
        <Box
            sx = {{
                display: 'flex',
                alignItems: 'center',
                p: 0.5,
                borderBottom: '1px solid #eee',
                backgroundColor: isHovered ? '#e3f2fd' : (result.correct ? 'transparent' : '#ffebee'),
                cursor: 'pointer',
                transition: 'background-color 0.15s',
            }}

            onMouseEnter = {() => setIsHovered(true)}
            onMouseLeave = {() => setIsHovered(false)}
        >

            {/* Thumbnail */}
            <Box sx ={{ width: 70, flexShrink: 0}}>
                <img
                    src = {result.thumbnail}
                    alt = {result.trueLabel}            // if image fails to load
                    style={{
                        width: isHovered ? 80 : 50,
                        height: isHovered ? 80 : 50,
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: `2px solid ${result.correct ? '#4caf50' : '#f44336'}`,
                        transition: 'all 0.2s',
                    }}
                />
            </Box>

            {/* True label */}
            <Box sx = {{ width: 60, flexShrink: 0}}>
                <Typography variant="caption" fontWeight="bold">
                    {result.trueLabel.toUpperCase()}
                </Typography>
            </Box>

            {/* Confidence bars for each class */}
            {CLASS_NAMES.map((cls, i) => {
                const prob = result.probabilities[i];
                const isThisTheTrue = result.trueLabel === cls;
                const isThisThePredicted = result.predictedClass === i;

                return (
                    <Box key = {cls} sx={{flex: 1, px: 0.5}}>
                        <Box sx= {{
                            width: '100%',
                            backgroundColor: '#e0e0e0',
                            borderRadius: 1,
                            height: 16,
                            position: 'relative',
                        }}>

                            <Box sx ={{
                                width: `${Math.round(prob*100)}%`,
                                hegiht: '100%',
                                borderRadius: 1,
                                backgroundColor: isThisTheTrue ? '#4caf50' : (isThisThePredicted ? '#f44336' : '#bdbdbd'), 
                                transition: 'width 0.2s',           
                            }} />
                            <Typography
                                variant="caption"
                                sx = {{
                                    position: "absolute",
                                    top: 0,
                                    left: 4,
                                    fontSize: 10,
                                    lineHeight: '16px',
                                    color: prob > 0.3 ? 'white' : 'text.secondary',
                                }}
                            >
                                {Math.round(prob*100)}%
                            </Typography>
                        </Box>
                    </Box>
                );
            })}                                    

            {/* Correct/Incorrect indicator */}
            <Box sx = {{ width: 40, flexShrink: 0, textAlign: 'center'}}>
                <Typography variant="body2">
                    {result.correct ? '✓' : '✗'}    
                </Typography>                                    
            </Box>
        </Box>
    );
}



            