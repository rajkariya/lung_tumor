import tensorflow as tf

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_model():
    try:
        model = tf.keras.models.load_model('/Users/raj/Downloads/ibm-project-1/python_backend/models/lung_cancer_model.keras')
        logger.info("Model loaded successfully")
        return model
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise

def predict(model, image_array, threshold=0.5):
    try:
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        # Make prediction
        prediction = model.predict(image_array)
        
        # Assuming binary classification: [no_tumor_prob, tumor_prob]
        tumor_prob = prediction[0][1]
        
        if tumor_prob >= threshold:
            return "Tumor", float(tumor_prob)
        else:
            return "No Tumor", float(1 - tumor_prob)
            
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise