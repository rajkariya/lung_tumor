import { useState, useEffect } from "react";
import { DataTable } from "../components/ui/data-table";
import { getAnalyses } from "../services/firebaseService";
import { Loader2 } from "lucide-react";

const columns = [
  {
    accessorKey: "patientId",
    header: "Patient ID",
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => {
      const confidence = row.getValue("confidence");
      return `${(confidence * 100).toFixed(2)}%`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "healthy"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "healthy" ? "Healthy" : "Tumor Detected"}
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return date.toLocaleDateString();
    },
  },
];

export default function Patients() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const data = await getAnalyses();
        setAnalyses(data);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">
          View and manage patient analysis records
        </p>
      </div>
      <DataTable columns={columns} data={analyses} />
    </div>
  );
} 