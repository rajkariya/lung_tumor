from PIL import Image
import numpy as np
import io

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
