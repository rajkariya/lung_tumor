import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Loader2, Download, Eye, Search } from "lucide-react";
import { getDashboardStats, getAnalyses } from "@/services/firebaseService";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { database, ref, onValue, query, orderByChild, equalTo } from "@/firebase/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const columns = [
  {
    accessorKey: "patient_id",
    header: "Patient ID",
  },
  {
    accessorKey: "prediction",
    header: "Diagnosis",
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => `${(row.original.confidence * 100).toFixed(2)}%`,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const analysis = row.original;
      
      const viewImage = () => {
        window.open(analysis.imageUrl, '_blank');
      };
      
      const downloadImage = () => {
        const link = document.createElement('a');
        link.href = analysis.imageUrl;
        link.download = `ct-scan-${analysis.patient_id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      
      return (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={viewImage}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadImage}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      );
    },
  },
];

const StatCard = ({ title, value, className }) => (
  <Card className={`p-6 ${className}`}>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAnalyses, setPatientAnalyses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, analysesData] = await Promise.all([
          getDashboardStats(),
          getAnalyses()
        ]);
        setStats(statsData);
        setAnalyses(analysesData);
        setFilteredAnalyses(analysesData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = analyses.filter(analysis => 
        analysis.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.prediction.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAnalyses(filtered);
    } else {
      setFilteredAnalyses(analyses);
    }
  }, [searchTerm, analyses]);

  useEffect(() => {
    if (selectedPatient) {
      // Fetch analyses for the selected patient
      const analysesRef = ref(database, "analyses");
      const patientAnalysesQuery = query(analysesRef, orderByChild("patient_id"), equalTo(selectedPatient));
      
      const unsubscribe = onValue(patientAnalysesQuery, (snapshot) => {
        if (snapshot.exists()) {
          const patientAnalysesData = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
          }));
          setPatientAnalyses(patientAnalysesData);
        } else {
          setPatientAnalyses([]);
        }
      });
      
      return () => {
        unsubscribe();
      };
    } else {
      setPatientAnalyses([]);
    }
  }, [selectedPatient]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePatientSelect = (patientId) => {
    setSelectedPatient(patientId);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pieChartData = [
    { name: 'Diagnosed', value: stats?.diagnosed || 0 },
    { name: 'Undiagnosed', value: (stats?.totalPatients || 0) - (stats?.diagnosed || 0) },
  ];

  const monthlyData = [
    { month: 'Jan', diagnosed: 12, undiagnosed: 8 },
    { month: 'Feb', diagnosed: 15, undiagnosed: 10 },
    { month: 'Mar', diagnosed: 18, undiagnosed: 7 },
    { month: 'Apr', diagnosed: 14, undiagnosed: 9 },
    { month: 'May', diagnosed: 20, undiagnosed: 12 },
    { month: 'Jun', diagnosed: 16, undiagnosed: 8 },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Unique Patients"
            value={stats?.totalPatients || 0}
            className="bg-white"
          />
          <StatCard
            title="Diagnosed with Lung Tumor"
            value={stats?.diagnosed || 0}
            className="bg-white"
          />
          <StatCard
            title="Undiagnosed"
            value={(stats?.totalPatients || 0) - (stats?.diagnosed || 0)}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Diagnosis Distribution</h2>
            <div className="h-64">
              <PieChart width={400} height={250}>
                <Pie
                  data={pieChartData}
                  cx={200}
                  cy={125}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Monthly Diagnosis Trends</h2>
            <div className="h-64">
              <BarChart
                width={400}
                height={250}
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="diagnosed" fill="#0088FE" name="Diagnosed" />
                <Bar dataKey="undiagnosed" fill="#00C49F" name="Undiagnosed" />
              </BarChart>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Analyses</h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by patient ID or diagnosis"
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredAnalyses}
          />
        </div>

        {selectedPatient && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Patient Analysis History</h2>
              <p className="text-sm text-gray-500">Patient ID: {selectedPatient}</p>
            </div>
            {patientAnalyses.length > 0 ? (
              <div className="p-6">
                <div className="space-y-4">
                  {patientAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {analysis.has_tumor ? "Tumor Detected" : "No Tumor Detected"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            Confidence: {(analysis.confidence * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(analysis.imageUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = analysis.imageUrl;
                              link.download = `ct-scan-${analysis.patient_id}.jpg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
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
            ) : (
              <div className="p-6 text-center text-gray-500">
                No analyses found for this patient.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 