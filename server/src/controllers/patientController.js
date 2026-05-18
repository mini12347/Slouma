import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Caregiver from '../models/caregiver.js';
import cache from '../config/cache.js';

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ 
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
    });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  const patientData = req.body;
  
  if (!patientData.id) {
    patientData.id = `PAT-${Date.now().toString().slice(-6)}`;
  }
  if (!patientData.lastname) patientData.lastname = 'Patient';
  if (!patientData.phone) patientData.phone = '00000000';
  if (!patientData.bloodGroup) patientData.bloodGroup = 'O+';
  if (!patientData.dateOfBirth) patientData.dateOfBirth = new Date();
  
  if (patientData.gender) {
    const g = patientData.gender.toLowerCase();
    if (g === 'male' || g === 'homme') patientData.gender = 'Male';
    else if (g === 'female' || g === 'femme') patientData.gender = 'Female';
    else if (g === 'other' || g === 'autre') patientData.gender = 'Other';
  } else {
    patientData.gender = 'Other';
  }

  const newPatient = new Patient(patientData);
  try {
    await newPatient.save();
    cache.flushAll();
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] };
  console.log(`Updating patient with ID: ${id}`, data);

  try {
  const patient = await Patient.findOne(query);
  if (!patient) {
    console.log(`Patient with ID ${id} not found`);
    return res.status(404).json({ message: 'Patient not found' });
  }

  const ALLOWED = ['name', 'lastname', 'email', 'phone', 'address',
                   'bloodGroup', 'dateOfBirth', 'gender', 'healthStatus',
                   'currentConditions', 'status', 'doctorIDs', 'caregiverIDs'];
  ALLOWED.forEach(field => {
    if (data[field] !== undefined) patient[field] = data[field];
  });

  const updatedPatient = await patient.save();
  cache.flushAll();

  if (data.doctorIDs) {
    await Doctor.updateMany(
      { $or: [{ id: { $in: data.doctorIDs } }, { _id: { $in: data.doctorIDs } }] },
      { $addToSet: { patientIDs: updatedPatient.id || updatedPatient._id.toString() } }
    );
  }

  if (data.caregiverIDs) {
    await Caregiver.updateMany(
      { $or: [{ id: { $in: data.caregiverIDs } }, { _id: { $in: data.caregiverIDs } }] },
      { $addToSet: { patientIDs: updatedPatient.id || updatedPatient._id.toString() } }
    );
  }

  console.log(`Patient with ID ${id} updated successfully`);
  res.status(200).json(updatedPatient);
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`Attempting to delete patient with ID: ${id}`);
    
    // 1. Try to delete from main Patient collection
    let deletedPatient = await Patient.findOneAndDelete({ 
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
    });
    
    // 2. If not found in primary, fallback to PendingUser staging collection
    if (!deletedPatient) {
      const { default: PendingUser } = await import('../models/PendingUser.js');
      deletedPatient = await PendingUser.findOneAndDelete({ 
        $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
      });
    }

    if (!deletedPatient) {
      console.log(`Patient with ID ${id} not found for deletion`);
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    cache.flushAll();
    console.log(`Patient with ID ${id} deleted successfully`);
    res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(`Error deleting patient ${id}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};

export const takeMedicine = async (req, res) => {
  const { id } = req.params;
  const { medicineId, medicineName } = req.body;
  
  try {
    const patient = await Patient.findOne({ 
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    patient.medicalHistory.push({
      date: new Date(),
      notes: `Medicine taken: ${medicineName || medicineId}`,
      conditions: []
    });
    
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add vital signs
// @route   POST /api/patients/:id/vitals
// @access  Public
export const addVitals = async (req, res) => {
  const { id } = req.params;
  const vitals = req.body;
  
  try {
    const newVitals = {
      date: new Date()
    };
    if (vitals.heartRate) newVitals.heartRate = Number(vitals.heartRate);
    if (vitals.bloodPressure) newVitals.bloodPressure = vitals.bloodPressure;
    if (vitals.temperature) newVitals.temperature = Number(vitals.temperature);
    if (vitals.weight) newVitals.weight = Number(vitals.weight);

    const updatedPatient = await Patient.findOneAndUpdate(
      { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] },
      { $push: { vitalSigns: newVitals } },
      { returnDocument: 'after' }
    );
    
    if (!updatedPatient) return res.status(404).json({ message: 'Patient not found' });
    
    cache.flushAll();
    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Error in addVitals:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add emergency contact
// @route   POST /api/patients/:id/emergency-contacts
// @access  Public
export const addEmergencyContact = async (req, res) => {
  const { id } = req.params;
  const contact = req.body;
  
  try {
    const patient = await Patient.findOne({ 
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    patient.emergencyContacts.push(contact);
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/patients/:id/emergency-contacts/:contactId
// @access  Public
export const deleteEmergencyContact = async (req, res) => {
  const { id, contactId } = req.params;
  
  try {
    const patient = await Patient.findOne({ 
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
    });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    patient.emergencyContacts = patient.emergencyContacts.filter(
      (contact) => contact._id.toString() !== contactId
    );
    
    await patient.save();
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
