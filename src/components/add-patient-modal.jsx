import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { v4 as uuidv4 } from "uuid"

export default function AddPatientModal({ isOpen, onClose, onAdd }) {
  const [patient, setPatient] = useState({ id: "", name: "", phone: "", email: "" })

  useEffect(() => {
    // Generate a UUID when the modal opens
    if (isOpen) {
      setPatient(prev => ({ ...prev, id: uuidv4() }))
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(patient)
    setPatient({ id: "", name: "", phone: "", email: "" }) // Reset form after submission
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="id">Patient ID</Label>
            <Input
              id="id"
              value={patient.id}
              readOnly
              disabled
            />
          </div>
          <div>
            <Label htmlFor="name">Patient Name</Label>
            <Input
              id="name"
              value={patient.name}
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={patient.phone}
              onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={patient.email}
              onChange={(e) => setPatient({ ...patient, email: e.target.value })}
              required
            />
          </div>
          <Button type="submit">Add Patient</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

AddPatientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,  // Boolean flag for modal visibility
  onClose: PropTypes.func.isRequired, // Function to handle closing the modal
  onAdd: PropTypes.func.isRequired,   // Function to handle adding a patient
}
