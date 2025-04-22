import { database, ref, set, push, get, update } from "@/firebase/firebase";

export const saveAnalysisResult = async (result) => {
  try {

    const analysesRef = ref(database, "analyses");
    const newAnalysisRef = push(analysesRef);
    
    await set(newAnalysisRef, {
      ...result,
      status: "diagnosed", // initial status
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return newAnalysisRef.key;
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
};

export const getAnalyses = async () => {
  try {
    const analysesRef = ref(database, "analyses");
    const snapshot = await get(analysesRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    }));
  } catch (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const analysesRef = ref(database, "analyses");
    const snapshot = await get(analysesRef);
    
    if (!snapshot.exists()) {
      return {
        totalPatients: 0,
        diagnosed: 0,
        inTreatment: 0,
        recovering: 0
      };
    }

    const analyses = Object.values(snapshot.val());
    
    // Get unique patient IDs
    const uniquePatientIds = new Set(analyses.map(analysis => analysis.patient_id));
    const totalPatients = uniquePatientIds.size;
    
    // Count diagnoses
    const diagnosed = analyses.filter(analysis => analysis.has_tumor).length;
    const noTumor = analyses.filter(analysis => !analysis.has_tumor).length;

    return {
      totalPatients,
      diagnosed,
      noTumor,
      totalScans: analyses.length
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const updatePatientStatus = async (analysisId, status) => {
  try {
    const analysisRef = ref(database, `analyses/${analysisId}`);
    await update(analysisRef, {
      status,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating patient status:", error);
    throw error;
  }
}; 