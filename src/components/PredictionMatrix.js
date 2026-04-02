import { useAtom } from "jotai";
import { predictionResultsAtom } from "../GlobalState";
import { Box, Typography, Button, Chip} from "@mui/material";
import { Component, useState } from "react";  
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

}
