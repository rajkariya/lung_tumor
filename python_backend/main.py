import os
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import uuid

from PIL import Image
import numpy as np
import io
import tensorflow as tf
from keras.models import load_model
from keras.preprocessing.image import img_to_array
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_keras_model():
    try:
        model = load_model('/Users/raj/Downloads/ibm-project-1/python_backend/models/lung_cancer_model.keras')
        logger.info("Model loaded successfully")
        return model
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise

def predict(model, image_array, threshold=0.5):
    try:
        image_array = np.expand_dims(image_array, axis=0)
        
        # Get raw prediction
        raw_prediction = model.predict(image_array)
        print(raw_prediction)
        logger.info(f"Raw model output: {raw_prediction}")
        
        # Get probabilities
        no_tumor_prob = raw_prediction[0][0]
        tumor_prob = raw_prediction[0][1]
        logger.info(f"Probability of no tumor: {no_tumor_prob:.4f}")
        logger.info(f"Probability of tumor: {tumor_prob:.4f}")
        
        if tumor_prob >= threshold:
            return "Tumor", float(tumor_prob)
        else:
            return "No Tumor", float(1 - tumor_prob)
            
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise

async def process_image(file, target_size=(224, 224)):
    """Process uploaded image to match model input requirements"""
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if not already
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Resize image
        image = image.resize(target_size)
        
        # Convert to array and normalize
        image_array = np.array(image) / 255.0
        
        return image_array
        
    except Exception as e:
        raise ValueError(f"Image processing failed: {str(e)}")

app = FastAPI(title="Brain Tumor Detection API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",  
    "https://your-production-domain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
async def startup_event():
    global model
    model = load_keras_model()

class PredictionResponse(BaseModel):
    patient_id: str
    prediction: str
    confidence: float
    has_tumor: bool
    message: Optional[str] = None

@app.post("/predict", response_model=PredictionResponse)
async def analyze_scan(
    file: UploadFile = File(...),
    patient_id: Optional[str] = None
):
    if not model:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Generate UUID if not provided
        if not patient_id:
            patient_id = str(uuid.uuid4())

        image = await process_image(file)
        
        prediction, confidence = predict(model, image)
        
        # Determine result
        has_tumor = prediction == "Tumor"
        message = (
            "Tumor detected with {:.2f}% confidence".format(confidence * 100)
            if has_tumor
            else "No tumor detected ({:.2f}% confidence)".format(confidence * 100)
        )
        
        return {
            "patient_id": patient_id,
            "prediction": prediction,
            "confidence": confidence,
            "has_tumor": has_tumor,
            "message": message
        }
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}