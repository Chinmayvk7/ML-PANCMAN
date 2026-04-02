import {
    Button,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    LinearProgress,
    Box
} from "@mui/material";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { buildModel, processImages, predictDirection, predictAllTrainingData } from "../model";
import {
    batchArrayAtom,
    trainingProgressAtom,
    lossAtom,
    modelAtom,
    truncatedMobileNetAtom,
    epochsAtom,
    batchSizeAtom,
    learningRateAtom,
    hiddenUnitsAtom,
    stopTrainingAtom,
    imgSrcArrAtom,
    gameRunningAtom,
    predictionAtom,
    confidenceThresholdAtom,
    confidenceStatusAtom,       
    predictionResultsAtom, 
} from "../GlobalState";
import { useAtom } from "jotai";
import { data, train } from "@tensorflow/tfjs";
// import JSONWriter from "./JSONWriter";
// import JSONLoader from "./JSONLoader";

function generateSelectComponent(
    label,
    options,
    handleChange,
    currentValue,
    isDisabled = false
) {
    return (
        <>
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                size="small"
                sx={{ minWidth: 120 }}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={currentValue}
                label={label}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isDisabled}
            >
                {options.map((option) => (
                    <MenuItem value={option}>{option}</MenuItem>
                ))}
            </Select>
        </>
    );
}

export default function MLTrain({ webcamRef }) {
    // ---- Configurations ----
    const [learningRate, setLearningRate] = useAtom(learningRateAtom);
    const [epochs, setEpochs] = useAtom(epochsAtom);
    const [hiddenUnits, setHiddenUnits] = useAtom(hiddenUnitsAtom);
    const [isRunning] = useAtom(gameRunningAtom);
    const [, setPredictionDirection] = useAtom(predictionAtom);
    const [confidenceThreshold, setConfidenceThreshold] = useAtom(confidenceThresholdAtom);
    const [, setConfidenceStatus] = useAtom(confidenceStatusAtom);
    const [, setPredictionResults] = useAtom(predictionResultsAtom);

    // ---- Model Training ----
    const [model, setModel] = useAtom(modelAtom);
    const [truncatedMobileNet] = useAtom(truncatedMobileNetAtom);
    const [imgSrcArr] = useAtom(imgSrcArrAtom);

    // ---- UI Display ----
    const [lossVal, setLossVal] = useAtom(lossAtom);
    const [trainingProgress, setTrainingProgress] = useAtom(trainingProgressAtom);


    const [batchSize, setBatchSize] = useAtom(batchSizeAtom);
    const batchValueArray = [0.05, 0.1, 0.4, 1].map(r=>Math.floor(imgSrcArr.length * r));
    
    const [, setStopTraining] = useAtom(stopTrainingAtom);

    // Reference to update isRunning
    const isRunningRef = useRef(isRunning);

     // Reference to update confidenceThresholdRef - for the slider to update when changed mid-game.
    const confidenceThresholdRef = useRef(confidenceThreshold); 

    // Updating isRunningRef reference
    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    //updating confidenceThresholdRef reference
    useEffect(() => {
        confidenceThresholdRef.current = confidenceThreshold;
    }, [confidenceThreshold]);

    // Loop to predict direction
    async function runPredictionLoop() {
        while (isRunningRef.current) {

            // We store result instead to directly using it 
            const result = await predictDirection(webcamRef, truncatedMobileNet, model);

            if(result){
                const classNames = ['up', 'down', 'left', 'right'];

                // update the confidence status diplay, that way the user sees the current confidence
                setConfidenceStatus({
                    confidence: result.confidence,
                    predictedClass: result.predictedClass,
                    predictedClassName: classNames[result.predictedClass],   // convert classId -> readable names
                    isAboveThreshold: result.confidence >= confidenceThresholdRef.current,
                    probabilities : result.probabilities,
                });

                // We only update the game direction if confidence is high enough
                if( result.confidence >= confidenceThresholdRef.current){
                    setPredictionDirection(result.direction);
                }

                // If confidence is below the threshold, we don't update predictionAtom
                // Update Pac-Man in such a way that it keeps its last direction (pauses in terms of new input)
            }

            await new Promise((resolve) => setTimeout(resolve, 250));
        }
    }

    // Call to run prediction loop
    useEffect(() => {
        if (isRunning && webcamRef.current != null && model != null) {
            runPredictionLoop();
        }
    }, [isRunning]);

    

    // Train the model when called
    async function trainModel() {
        setTrainingProgress("Stop");
        const dataset = await processImages(imgSrcArr, truncatedMobileNet);
        const trainedModel = await buildModel(
            truncatedMobileNet,
            setLossVal,
            dataset,
            hiddenUnits,
            batchSize,
            epochs,
            learningRate
        );
        setModel(trainedModel);

        const results = await predictAllTrainingData(truncatedMobileNet, trainedModel, imgSrcArr);
        setPredictionResults(results);
    }

    const stopTrain = () => {
        setStopTraining(true);
    };

    const EmptyDatasetDisaply = (
        <Typography variant="h6" sx={{ marginTop: "10px" }}>
            Please collect some data first! 
            {/* Or <JSONLoader /> */}
        </Typography>
    );

    const ReguarlDisplay = (
        <Grid container space={2}>
            <Grid item xs={6}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        trainingProgress == -1? trainModel() : stopTrain();
                    }}
                >
                    {trainingProgress == -1 ? "Train" : lossVal? "Stop": 'Loading...'}
                </Button>
                <LinearProgress
                    variant="determinate"
                    value={trainingProgress}
                    style={{
                        display: trainingProgress === 0 ? "none" : "block",
                        width: "75%",
                        marginTop: "10px",
                    }}
                />
                <Typography variant="h6">
                    LOSS: {lossVal === null ? "" : lossVal} <br />
                    Dataset Size: {imgSrcArr.length} <br />
                </Typography>
                {/* Confidence Threshold Slider - Improvement 2*/}
                <Box sx = {{ mt: 2, mb: 1}}>
                    <Typography variant="body2" gutterBottom>
                        Confidence Threshold: {Math.round(confidenceThreshold*100)}%
                    </Typography>
                    <input
                        type = "range"
                        min = "0.2"
                        max = "0.95"
                        step = "0.05"
                        value = {confidenceThreshold}
                        onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                        style = {{width: '75%' }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                            Low = aggressive (moves on low confidence) | High = conservative (only moves on clear gestures)
                        </Typography>
                </Box>


                {/* <JSONWriter /> <br /> */}
            </Grid>
            <Grid item xs={6}>
                <div className="hyper-params">
                    {/* <label>Learning rate</label> */}
                    {generateSelectComponent(
                        "Learning Rate",
                        [0.003, 0.001, 0.0001, 0.00001],
                        setLearningRate,
                        learningRate
                    )}

                    {/* <label>Epochs</label> */}
                    {generateSelectComponent(
                        "Epochs",
                        [10, 100, 200, 500],
                        setEpochs,
                        epochs
                    )}

                    {/* <label>Batch size </label> */}
                    {generateSelectComponent(
                        "Batch Size",
                        batchValueArray,
                        setBatchSize,
                        batchSize,
                        false
                    )}

                    {/* <label>Hidden units</label> */}
                    {generateSelectComponent(
                        "Hidden units",
                        [10, 100, 200],
                        setHiddenUnits,
                        hiddenUnits
                    )}
                </div>
            </Grid>
        </Grid>
    );

    return (
        <Suspense fallback={<div>Loading...</div>}>
            {imgSrcArr.length === 0 ? EmptyDatasetDisaply : ReguarlDisplay}
        </Suspense>
    );
}
