import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import AddPatientModal from "@/components/add-patient-modal";
import EditPatientModal from "@/components/EditPatientModal";
import Navbar from "@/components/Navbar";
import { database, ref, set, update, remove, onValue } from "@/firebase/firebase";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

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

  const handleAddPatient = (patient) => {
    const patientRef = ref(database, `patients/${patient.id}`);

    set(patientRef, patient)
      .then(() => {
        setIsAddModalOpen(false); 
      })
      .catch((error) => {
        console.error("Error adding patient: ", error);
      });
  };

  const handleEditPatient = (editedPatient) => {
    const patientRef = ref(database, `patients/${editedPatient.id}`);
    update(patientRef, editedPatient)
      .then(() => {
        setIsEditModalOpen(false);
        setEditingPatient(null);
      })
      .catch((error) => {
        console.error("Error updating patient: ", error);
      });
  };

  const handleDeletePatient = (id) => {
    const patientRef = ref(database, `patients/${id}`);
    remove(patientRef)
      .then(() => {
        setPatients(patients.filter((patient) => patient.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting patient: ", error);
      });
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setIsEditModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Patient List</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 hover:bg-blue-500 hover:text-white"
                    onClick={() => openEditModal(patient)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-500 hover:text-white"
                    onClick={() => handleDeletePatient(patient.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AddPatientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddPatient}
        />
        {editingPatient && (
          <EditPatientModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditPatient}
            patientData={editingPatient}
          />
        )}
      </div>
    </>
  );
};

export default PatientList;