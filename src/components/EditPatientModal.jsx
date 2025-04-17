import { useState } from "react"
import PropTypes from "prop-types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EditPatientModal = ({ isOpen, onClose, patientData, onSave }) => {
  const [patient, setPatient] = useState(patientData || { id: "", name: "", phone: "", email: "" })

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(patient)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="id">Patient ID</Label>
            <Input id="id" name="id" value={patient.id} onChange={handleChange} disabled />
          </div>
          <div>
            <Label htmlFor="name">Patient Name</Label>
            <Input id="name" name="name" value={patient.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" value={patient.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={patient.email} onChange={handleChange} required />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ✅ PropTypes Validation
EditPatientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // Boolean flag for modal visibility
  onClose: PropTypes.func.isRequired, // Function to handle modal closing
  onSave: PropTypes.func.isRequired, // Function to save patient data
  patientData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired, // Patient object structure validation
}

export default EditPatientModal
