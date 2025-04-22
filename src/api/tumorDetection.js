const API_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

export const analyzeCTScan = async (patientId, file) => {
  const formData = new FormData();
  formData.append('patient_id', patientId);
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Complete API Response:', result);
    return result;
  } catch (error) {
    console.error('Error analyzing CT scan:', error);
    throw error;
  }
};

export const notifyDoctor = async (patientId, result) => {
  console.log(`Notifying doctor about patient ${patientId}: ${result}`);
  return { success: true };
};