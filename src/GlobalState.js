import { atom } from "jotai";
import { loadTruncatedMobileNet } from "./model";

// ---- Configurations ----
export const epochsAtom = atom(100); // Number of epochs
export const batchSizeAtom = atom(1); // Selected batch size
export const hiddenUnitsAtom = atom(100); // Number of hidden units
export const learningRateAtom = atom(0.0001); // Learning rate
export const gameRunningAtom = atom(false); // Game state
export const predictionAtom = atom(null); // Current prediction

// ---- Model Training ----
export const modelAtom = atom(null); // Model
export const truncatedMobileNetAtom = atom(loadTruncatedMobileNet()); // truncatedMobileNet
export const imgSrcArrAtom = atom([]); // collected images, formate {src: string, label: string}

// ---- UI Display ----
export const lossAtom = atom(null); // Loss value
export const trainingProgressAtom = atom(-1); // Training progress
export const stopTrainingAtom = atom(false); // Flag to stop training

// ---- Imporvement 1: Prediction Matrix ----
export const predictionResultsAtom = atom([]); // Array of prediction results for training data

// ---- Improvement 2: Confidence Gate ----
export const confidenceThresholdAtom = atom(0.5) // Default 50% threshold
export const confidenceStatusAtom = atom({
    confidence : 0, 
    predictedClass : -1, 
    isAboveThreshold : true
});

