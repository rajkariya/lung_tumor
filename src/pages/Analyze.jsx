import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { analyzeCTScan } from "@/api/tumorDetection";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { saveAnalysisResult } from "@/services/firebaseService";
import { Loader2, Download, Eye } from "lucide-react";
import {
  database,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  storage
} from "@/firebase/firebase";
import { Select } from "@/components/ui/select";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";

const Analyze = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);
  const [showPreviousAnalyses, setShowPreviousAnalyses] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const patientsRef = ref(database, "patients");

    const unsubscribe = onValue(patientsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const patientList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setPatients(patientList);
      } else {
        setPatients([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      const analysesRef = ref(database, "analyses");
      const patientAnalysesQuery = query(analysesRef, orderByChild("patient_id"), equalTo(selectedPatient.id));

      const unsubscribe = onValue(patientAnalysesQuery, (snapshot) => {
        if (snapshot.exists()) {
          const analyses = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          }));
          setPreviousAnalyses(analyses);
        } else {
          setPreviousAnalyses([]);
        }
      });

      return () => {
        unsubscribe();
      };
    } else {
      setPreviousAnalyses([]);
    }
  }, [selectedPatient]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePatientChange = (e) => {
    const patientId = e.target.value;
    if (patientId) {
      const patient = patients.find((p) => p.id === patientId);
      setSelectedPatient(patient);
      setShowPreviousAnalyses(true);
    } else {
      setSelectedPatient(null);
      setShowPreviousAnalyses(false);
    }
  };

  const downloadImage = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "ct-scan.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "Validation Error",
        description: "Please select a CT scan image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const patientId = selectedPatient ? selectedPatient.id : uuidv4();
    const { name = "Unknown", email = "", phone = "" } = selectedPatient || {};

    try {
      const analysisResult = await analyzeCTScan(patientId, file);
      
      // Upload image to Firebase Storage
      const imageStorageRef = storageRef(storage, `ct-scans/${patientId}_${Date.now()}.jpg`);
      await uploadBytes(imageStorageRef, file);
      const imageUrl = await getDownloadURL(imageStorageRef);
      
      // Construct the full result object
      const fullResult = {
        ...analysisResult,
        patient_id: patientId,
        name,
        email,
        phone,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save to Firebase
      await saveAnalysisResult(fullResult);
      
      setResult(fullResult);
      toast({
        title: "Analysis Complete",
        description: analysisResult.message,
      });
    } catch (error) {
      console.error("Error during analysis:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotify = async () => {
    if (!result || !selectedPatient?.email) {
      toast({
        title: "Notification Error",
        description: "Patient email is required for sending notifications",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_NODEJS_URL}/send-report`, {
        patientEmail: selectedPatient.email,
        patientName: selectedPatient.name,
        phone: selectedPatient.phone,
        hasTumor: result.has_tumor,
        confidence: result.confidence,
        message: result.message,
        imageUrl: result.imageUrl,
      });

      if (response.status === 200) {
        toast({
          title: "Notification Sent",
          description: "The patient has been notified about the results",
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Notification Failed",
        description: "Failed to send notification to the patient",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto mt-10 space-y-6 p-4">
        <div>
          <Label htmlFor="patient" className="text-foreground">
            Select Patient (optional)
          </Label>
          <Select
            id="patient"
            value={selectedPatient?.id || ""}
            onChange={handlePatientChange}
            className="mt-1"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} ({patient.id})
              </option>
            ))}
          </Select>
        </div>

        {showPreviousAnalyses && previousAnalyses.length > 0 && (
          <div className="mt-4 p-4 border rounded-md">
            <h3 className="font-bold text-lg mb-2">Previous Analyses</h3>
            <div className="space-y-2">
              {previousAnalyses.map((analysis) => (
                <div key={analysis.id} className="p-2 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {analysis.has_tumor ? "Tumor Detected" : "No Tumor Detected"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(analysis.imageUrl, "_blank")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(analysis.imageUrl)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="ctScan" className="text-foreground">
            Upload Image (required)
          </Label>
          <Input
            id="ctScan"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 bg-background text-foreground border-gray-300"
          />
        </div>

        {preview && (
          <div className="mt-4">
            <Label className="text-foreground">Image Preview</Label>
            <div className="mt-2 relative h-64 w-full overflow-hidden rounded-lg border border-gray-300">
              <img
                src={preview}
                alt="CT Scan Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Scan"
            )}
          </Button>

          {result && (
            <Button
              onClick={handleNotify}
              variant="secondary"
              className="w-full"
            >
              Alert and Notify Patient
            </Button>
          )}
        </div>

        {result && (
          <div className="mt-6 p-4 border rounded-md">
            <h3 className="font-bold text-lg mb-2">Analysis Results</h3>
            <p className="text-foreground">{result.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Analyze;
