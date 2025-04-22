import { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import { Button } from "@/components/ui/button";
import { Plus, Download, Edit, Trash2 } from "lucide-react";
import AddPatientModal from "@/components/add-patient-modal";
import EditPatientModal from "@/components/EditPatientModal";
import Navbar from "@/components/Navbar";
import { database, ref, set, update, remove, onValue } from "@/firebase/firebase";
import { CSVLink } from "react-csv";
import { toast, ToastContainer } from "react-toastify";
import * as yup from "yup";
import "react-toastify/dist/ReactToastify.css";

// Validation schema for patient data
const patientSchema = yup.object().shape({
  id: yup.string().required("Patient ID is required").min(3, "ID must be at least 3 characters"),
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^\+?[1-9]\d{1,14}$/, "Phone number is invalid"),
  email: yup.string().required("Email is required").email("Email is invalid"),
});

// Custom styles for DataTable
const customStyles = {
  header: {
    style: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
  },
  headCells: {
    style: {
      fontSize: "1rem",
      fontWeight: "bold",
      backgroundColor: "#f3f4f6",
    },
  },
  cells: {
    style: {
      fontSize: "0.9rem",
    },
  },
};

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  // Fetch patients from Firebase
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

  // Validate patient data and check for unique ID
  const validatePatient = async (patient, isEdit = false) => {
    try {
      await patientSchema.validate(patient, { abortEarly: false });

      // Check for unique ID (skip for edit if ID hasn't changed)
      const existingPatient = patients.find(
        (p) => p.id === patient.id && (!isEdit || p.id !== editingPatient?.id)
      );
      if (existingPatient) {
        throw new Error("Patient ID already exists");
      }
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = error.inner.reduce((acc, curr) => {
          acc[curr.path] = curr.message;
          return acc;
        }, {});
        return { isValid: false, errors };
      }
      return { isValid: false, errors: { id: error.message } };
    }
  };

  // Handle adding a new patient
  const handleAddPatient = async (patient) => {
    const validation = await validatePatient(patient);
    if (!validation.isValid) {
      toast.error("Please fix the form errors");
      return validation.errors;
    }

    const patientRef = ref(database, `patients/${patient.id}`);
    try {
      await set(patientRef, patient);
      toast.success("Patient added successfully");
      setIsAddModalOpen(false);
      return {};
    } catch (error) {
      toast.error("Failed to add patient");
      console.error("Error adding patient: ", error);
      return { form: "Failed to add patient" };
    }
  };

  // Handle editing a patient
  const handleEditPatient = async (editedPatient) => {
    const validation = await validatePatient(editedPatient, true);
    if (!validation.isValid) {
      toast.error("Please fix the form errors");
      return validation.errors;
    }

    const patientRef = ref(database, `patients/${editedPatient.id}`);
    try {
      await update(patientRef, editedPatient);
      toast.success("Patient updated successfully");
      setIsEditModalOpen(false);
      setEditingPatient(null);
      setSelectedRows([]);
      return {};
    } catch (error) {
      toast.error("Failed to update patient");
      console.error("Error updating patient: ", error);
      return { form: "Failed to update patient" };
    }
  };

  // Handle bulk deletion of selected patients
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.warn("No patients selected");
      return;
    }

    try {
      await Promise.all(
        selectedRows.map((row) => {
          const patientRef = ref(database, `patients/${row.id}`);
          return remove(patientRef);
        })
      );
      setPatients(patients.filter((patient) => !selectedRows.some((row) => row.id === patient.id)));
      setSelectedRows([]);
      toast.success(`${selectedRows.length} patient(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete patients");
      console.error("Error deleting patients: ", error);
    }
  };

  // Handle edit action (single row only)
  const handleEditSelected = () => {
    if (selectedRows.length !== 1) {
      toast.warn("Please select exactly one patient to edit");
      return;
    }
    setEditingPatient(selectedRows[0]);
    setIsEditModalOpen(true);
  };

  // Filter patients based on search input
  const filteredPatients = useMemo(() => {
    return patients.filter(
      (patient) =>
        patient.id.toLowerCase().includes(filterText.toLowerCase()) ||
        patient.name.toLowerCase().includes(filterText.toLowerCase()) ||
        patient.phone.toLowerCase().includes(filterText.toLowerCase()) ||
        patient.email.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [patients, filterText]);

  // DataTable columns (removed Actions column)
  const columns = [
    {
      name: "Patient ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
  ];

  // CSV export headers
  const csvHeaders = [
    { label: "Patient ID", key: "id" },
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone" },
    { label: "Email", key: "email" },
  ];

  // Handle row selection
  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Patient List</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
            <Button
              variant="outline"
              onClick={handleEditSelected}
              disabled={selectedRows.length !== 1}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Selected
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={selectedRows.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedRows.length})
            </Button>
            <Button asChild>
              <CSVLink
                data={filteredPatients}
                headers={csvHeaders}
                filename={"patients.csv"}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </CSVLink>
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search patients..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setResetPaginationToggle(false);
            }}
            className="w-full max-w-sm p-2 border rounded"
          />
        </div>

        {/* DataTable */}
        <DataTable
          title="Patients"
          columns={columns}
          data={filteredPatients}
          pagination
          paginationResetDefaultPage={resetPaginationToggle}
          selectableRows
          onSelectedRowsChange={handleRowSelected}
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover
          responsive
          noDataComponent={<div className="p-4">No patients found.</div>}
        />

        {/* Modals */}
        <AddPatientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddPatient}
        />
        {editingPatient && (
          <EditPatientModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingPatient(null);
            }}
            onSave={handleEditPatient}
            patientData={editingPatient}
          />
        )}

        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </>
  );
};

export default PatientList;