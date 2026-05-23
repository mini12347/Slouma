import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Caregiver from "../models/caregiver.js";
import PendingUser from "../models/PendingUser.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import bcrypt from "bcryptjs";
import cache from "../config/cache.js";


const createAdmin = async (req, res) => {
    const admin = req.body;
    try {
        const newAdmin = new Admin(admin);
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const getAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findOne({ 
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
        });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const admin = req.body;
    try {
        const updatedAdmin = await Admin.findOneAndUpdate(
            { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] },
            admin,
            { new: true }
        );
        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const verifyAdminPassword = async (req, res) => {
    const { adminId, password } = req.body;
    try {
        const admin = await Admin.findOne({ 
            $or: [{ _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }, { id: adminId }] 
        });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
        
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAdmin = await Admin.findOneAndDelete({ 
            $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] 
        });
        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createUser = async (req, res) => {
    const { role, userData } = req.body;
    try {
        let newUser;
        const baseData = { 
            ...userData, 
            status: userData.status || 'active',
            lastname: userData.lastname || 'User',
            phone: userData.phone || '00000000',
            address: userData.address || '',
        };

        if (role === 'Patient') {
            newUser = new Patient({ 
                ...baseData, 
                bloodGroup: userData.bloodGroup || 'O+', 
                dateOfBirth: userData.dateOfBirth || new Date(), 
                gender: userData.gender || 'Other',
                vitalSigns: userData.vitalSigns || []
            });
        }
        else if (role === 'Doctor') {
            newUser = new Doctor({
                ...baseData,
                specialty: userData.specialty || 'General'
            });
        }
        else if (role === 'Caregiver') {
            newUser = new Caregiver(baseData);
        }
        else if (role === 'Admin') {
            newUser = new Admin(baseData);
        }
        else return res.status(400).json({ message: 'Invalid role' });

        await newUser.save();

        // If it's a patient, link them to their doctor and caregiver
        if (role === 'Patient') {
            const { linkPatientDoctor, linkPatientCaregiver } = await import('../services/linkingService.js');
            if (userData.doctorID) {
                await linkPatientDoctor(newUser.id, userData.doctorID);
            }
            if (userData.caregiverID) {
                await linkPatientCaregiver(newUser.id, userData.caregiverID);
            }
        }

        // Create Welcome Notification
        const welcomeNotification = new Notification({
            id: `NTF-WELCOME-${Date.now()}-${newUser.id}`,
            receiverID: newUser.id,
            content: `Welcome to Slouma Health, ${newUser.name}! Your account as a ${role} has been created.`,
            type: 'info',
            date: new Date(),
            read: false
        });
        await welcomeNotification.save();

        // Create Welcome Message
        const welcomeMessage = new Message({
            senderID: 'admin-system',
            receiverID: newUser._id,
            message: `Hello ${newUser.name}, welcome to our platform. We are glad to have you here.`,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });
        await welcomeMessage.save();

        // Log activity
        const adminId = req.headers['x-admin-id'];
        if (adminId) {
            await Admin.findOneAndUpdate(
                { $or: [{ _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }, { id: adminId }] },
                { $push: { activityLog: { msg: `Created new ${role}: ${newUser.name}`, user: 'Admin' } } }
            );
        }

        // Invalidate all admin dashboard caches
        cache.flushAll();

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    const { role, id } = req.params;
    const userData = req.body;
    try {
        const normalizedRole = role?.toLowerCase().trim();
        const query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] };

        // Prevent ID modification
        delete userData.id;
        delete userData._id;

        console.log(`Admin updating ${normalizedRole} with ID: ${id}`);

        // Use findOne + save() to ensure Mongoose setters (encryption) fire
        let doc;
        if (normalizedRole === 'patient') doc = await Patient.findOne(query);
        else if (normalizedRole === 'doctor') doc = await Doctor.findOne(query);
        else if (normalizedRole === 'caregiver') doc = await Caregiver.findOne(query);
        else if (normalizedRole === 'admin') doc = await Admin.findOne(query);

        if (!doc) {
            console.log(`Update failed: User not found. Role: ${role}, ID: ${id}`);
            return res.status(404).json({ message: `${role} not found` });
        }

        // Apply each allowed field — setters will encrypt sensitive fields automatically
        const ALLOWED = ['name', 'lastname', 'email', 'phone', 'address', 'status',
                         'bloodGroup', 'dateOfBirth', 'gender', 'specialty', 'department',
                         'healthStatus', 'currentConditions'];
        ALLOWED.forEach(field => {
            if (userData[field] !== undefined) doc[field] = userData[field];
        });

        // Custom handling for Patient's doctor and caregiver sync
        let updated;
        if (normalizedRole === 'patient') {
            const oldDoctorIDs = [...(doc.doctorIDs || [])];
            const oldCaregiverIDs = [...(doc.caregiverIDs || [])];

            const newDoctorIDs = userData.doctorIDs || [];
            const newCaregiverIDs = userData.caregiverIDs || [];

            if (userData.doctorIDs !== undefined) doc.doctorIDs = userData.doctorIDs;
            if (userData.caregiverIDs !== undefined) doc.caregiverIDs = userData.caregiverIDs;

            updated = await doc.save();

            const patientId = updated.id || updated._id.toString();

            // Doctor sync
            const doctorsToRemove = oldDoctorIDs.filter(id => !newDoctorIDs.includes(id));
            const doctorsToAdd = newDoctorIDs.filter(id => !oldDoctorIDs.includes(id));

            if (doctorsToRemove.length > 0) {
                const objectIdsToRemove = doctorsToRemove.filter(id => mongoose.Types.ObjectId.isValid(id));
                const stringIdsToRemove = doctorsToRemove.filter(id => !mongoose.Types.ObjectId.isValid(id));
                
                const removeQuery = { $or: [] };
                if (stringIdsToRemove.length > 0) removeQuery.$or.push({ id: { $in: stringIdsToRemove } });
                if (objectIdsToRemove.length > 0) removeQuery.$or.push({ _id: { $in: objectIdsToRemove } });
                if (removeQuery.$or.length === 0) removeQuery.$or = [{ id: { $in: doctorsToRemove } }];
                
                await Doctor.updateMany(removeQuery, { $pull: { patientIDs: patientId } });
            }
            if (doctorsToAdd.length > 0) {
                const objectIdsToAdd = doctorsToAdd.filter(id => mongoose.Types.ObjectId.isValid(id));
                const stringIdsToAdd = doctorsToAdd.filter(id => !mongoose.Types.ObjectId.isValid(id));
                
                const addQuery = { $or: [] };
                if (stringIdsToAdd.length > 0) addQuery.$or.push({ id: { $in: stringIdsToAdd } });
                if (objectIdsToAdd.length > 0) addQuery.$or.push({ _id: { $in: objectIdsToAdd } });
                if (addQuery.$or.length === 0) addQuery.$or = [{ id: { $in: doctorsToAdd } }];
                
                await Doctor.updateMany(addQuery, { $addToSet: { patientIDs: patientId } });
            }

            // Caregiver sync
            const caregiversToRemove = oldCaregiverIDs.filter(id => !newCaregiverIDs.includes(id));
            const caregiversToAdd = newCaregiverIDs.filter(id => !oldCaregiverIDs.includes(id));

            if (caregiversToRemove.length > 0) {
                const objectIdsToRemove = caregiversToRemove.filter(id => mongoose.Types.ObjectId.isValid(id));
                const stringIdsToRemove = caregiversToRemove.filter(id => !mongoose.Types.ObjectId.isValid(id));
                
                const removeQuery = { $or: [] };
                if (stringIdsToRemove.length > 0) removeQuery.$or.push({ id: { $in: stringIdsToRemove } });
                if (objectIdsToRemove.length > 0) removeQuery.$or.push({ _id: { $in: objectIdsToRemove } });
                if (removeQuery.$or.length === 0) removeQuery.$or = [{ id: { $in: caregiversToRemove } }];
                
                await Caregiver.updateMany(removeQuery, { $pull: { patientIDs: patientId } });
            }
            if (caregiversToAdd.length > 0) {
                const objectIdsToAdd = caregiversToAdd.filter(id => mongoose.Types.ObjectId.isValid(id));
                const stringIdsToAdd = caregiversToAdd.filter(id => !mongoose.Types.ObjectId.isValid(id));
                
                const addQuery = { $or: [] };
                if (stringIdsToAdd.length > 0) addQuery.$or.push({ id: { $in: stringIdsToAdd } });
                if (objectIdsToAdd.length > 0) addQuery.$or.push({ _id: { $in: objectIdsToAdd } });
                if (addQuery.$or.length === 0) addQuery.$or = [{ id: { $in: caregiversToAdd } }];
                
                await Caregiver.updateMany(addQuery, { $addToSet: { patientIDs: patientId } });

                const { linkPatientCaregiver } = await import('../services/linkingService.js');
                for (const cgId of caregiversToAdd) {
                    await linkPatientCaregiver(patientId, cgId);
                }
            }
        } else if (normalizedRole === 'caregiver') {
            const oldPatientIDs = [...(doc.patientIDs || [])];
            const newPatientIDs = userData.patientIDs || [];

            if (userData.patientIDs !== undefined) doc.patientIDs = userData.patientIDs;

            updated = await doc.save();

            const caregiverId = updated.id || updated._id.toString();

            // Patient sync
            const patientsToRemove = oldPatientIDs.filter(id => !newPatientIDs.includes(id));
            const patientsToAdd = newPatientIDs.filter(id => !oldPatientIDs.includes(id));

            if (patientsToRemove.length > 0) {
                const objectIdsToRemove = patientsToRemove.filter(id => mongoose.Types.ObjectId.isValid(id));
                const stringIdsToRemove = patientsToRemove.filter(id => !mongoose.Types.ObjectId.isValid(id));
                
                const removeQuery = { $or: [] };
                if (stringIdsToRemove.length > 0) removeQuery.$or.push({ id: { $in: stringIdsToRemove } });
                if (objectIdsToRemove.length > 0) removeQuery.$or.push({ _id: { $in: objectIdsToRemove } });
                if (removeQuery.$or.length === 0) removeQuery.$or = [{ id: { $in: patientsToRemove } }];
                
                await Patient.updateMany(removeQuery, { $pull: { caregiverIDs: caregiverId } });
            }
            if (patientsToAdd.length > 0) {
                const objectIdsToAdd = patientsToAdd.filter(id => mongoose.Types.ObjectId.isValid(id));
                const stringIdsToAdd = patientsToAdd.filter(id => !mongoose.Types.ObjectId.isValid(id));
                
                const addQuery = { $or: [] };
                if (stringIdsToAdd.length > 0) addQuery.$or.push({ id: { $in: stringIdsToAdd } });
                if (objectIdsToAdd.length > 0) addQuery.$or.push({ _id: { $in: objectIdsToAdd } });
                if (addQuery.$or.length === 0) addQuery.$or = [{ id: { $in: patientsToAdd } }];
                
                await Patient.updateMany(addQuery, { $addToSet: { caregiverIDs: caregiverId } });

                const { linkPatientCaregiver } = await import('../services/linkingService.js');
                for (const pid of patientsToAdd) {
                    await linkPatientCaregiver(pid, caregiverId);
                }
            }
        } else {
            updated = await doc.save();
        }

        // Log activity
        const adminId = req.headers['x-admin-id'];
        if (adminId) {
            await Admin.findOneAndUpdate(
                { $or: [{ _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }, { id: adminId }] },
                { $push: { activityLog: { msg: `Updated ${role}: ${updated.name}`, user: 'Admin', date: new Date() } } }
            );
        }

        cache.flushAll();

        res.status(200).json(updated);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: error.message });
    }
}

const deleteUser = async (req, res) => {
    const { role, id } = req.params;
    try {
        let deleted;
        const query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] };
        
        // Try deleting from PendingUser staging first
        deleted = await PendingUser.findOneAndDelete(query);
        
        if (!deleted) {
            const normalizedRole = role?.toLowerCase().trim();
            if (normalizedRole === 'patient') deleted = await Patient.findOneAndDelete(query);
            else if (normalizedRole === 'doctor') deleted = await Doctor.findOneAndDelete(query);
            else if (normalizedRole === 'caregiver') deleted = await Caregiver.findOneAndDelete(query);
            else if (normalizedRole === 'admin') deleted = await Admin.findOneAndDelete(query);
            else return res.status(400).json({ message: `Invalid role: ${role}` });
        }
        
        if (!deleted) return res.status(404).json({ message: `${role || 'User'} not found` });

        const adminId = req.headers['x-admin-id'];
        if (adminId) {
            await Admin.findOneAndUpdate(
                { $or: [{ _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }, { id: adminId }] },
                { $push: { activityLog: { msg: `Deleted ${role}: ${deleted.name}`, user: 'Admin' } } }
            );
        }

        cache.flushAll();

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const approveUser = async (req, res) => {
    const { id, role } = req.body;
    try {
        const query = { $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { id: id }] };
        const update = { status: 'active' };
        const options = { new: true };
        
        let updated;
        
        // 1. Try to find the user in the PendingUser staging collection
        const pendingUser = await PendingUser.findOne(query);
        
        if (pendingUser) {
            // Convert to a plain object and set status to active
            const userData = pendingUser.toObject();
            userData.status = 'active';
            
            // Assign sequential / formatted ID
            const prefix = userData.role === 'Patient' ? 'PAT' : userData.role === 'Caregiver' ? 'CG' : userData.role === 'Doctor' ? 'DOC' : 'ADM';
            userData.id = `${prefix}${Date.now()}`;
            
            // Create user in the database (this will trigger their model hook to hash the password exactly once)
            const { createUser } = await import('../services/userService.js');
            updated = await createUser(userData);
            
            // Link patient to doctor and caregiver
            if (userData.role === 'Patient') {
                const { linkPatientDoctor, linkPatientCaregiver } = await import('../services/linkingService.js');
                let linkedDocs = new Set();
                if (req.body.doctorID) {
                    await linkPatientDoctor(updated.id, req.body.doctorID);
                    linkedDocs.add(req.body.doctorID);
                }
                if (userData.doctorIDs && userData.doctorIDs.length > 0) {
                    for (const docId of userData.doctorIDs) {
                        if (!linkedDocs.has(docId)) {
                            await linkPatientDoctor(updated.id, docId);
                            linkedDocs.add(docId);
                        }
                    }
                }
                if (userData.caregiverIDs && userData.caregiverIDs.length > 0) {
                    for (const cgId of userData.caregiverIDs) {
                        await linkPatientCaregiver(updated.id, cgId);
                    }
                }
            } else if (userData.role === 'Caregiver') {
                const { linkPatientCaregiver } = await import('../services/linkingService.js');
                if (userData.patientIDs && userData.patientIDs.length > 0) {
                    for (const pid of userData.patientIDs) {
                        await linkPatientCaregiver(pid, updated.id);
                    }
                }
                
                // Also update the caregiver document to include patientIDs
                await Caregiver.findOneAndUpdate(
                    { $or: [{ _id: mongoose.Types.ObjectId.isValid(updated.id) ? updated.id : null }, { id: updated.id }] },
                    { $set: { patientIDs: userData.patientIDs } }
                );
            }
            
            // Clean up staging PendingUser record
            await PendingUser.deleteOne({ _id: pendingUser._id });
        } else {
            // 2. Fallback: check if they are already created and just need their status updated
            if (role === 'Patient') {
                updated = await Patient.findOneAndUpdate(query, update, options);
                if (updated && req.body.doctorID) {
                    const { linkPatientDoctor } = await import('../services/linkingService.js');
                    await linkPatientDoctor(updated.id, req.body.doctorID);
                }
            }
            else if (role === 'Doctor') updated = await Doctor.findOneAndUpdate(query, update, options);
            else if (role === 'Caregiver') updated = await Caregiver.findOneAndUpdate(query, update, options);
            else if (role === 'Admin') updated = await Admin.findOneAndUpdate(query, update, options);
        }
        
        if (!updated) return res.status(404).json({ message: 'User not found' });

        // Create Approval Notification
        const approvalNotification = new Notification({
            id: `NTF-APPROVE-${Date.now()}-${updated.id}`,
            receiverID: updated.id,
            content: `Congratulations! Your account as a ${role || updated.role || 'user'} has been approved by the administrator. You can now log in.`,
            type: 'success',
            date: new Date(),
            read: false
        });
        await approvalNotification.save();

        // Create Welcome Message
        const welcomeMessage = new Message({
            senderID: 'admin-system',
            receiverID: updated._id,
            message: `Hello ${updated.name}, welcome to our platform. We are glad to have you here.`,
            date: new Date(),
            time: new Date().toLocaleTimeString()
        });
        await welcomeMessage.save();

        // Invalidate cache and log activity
        const adminId = req.headers['x-admin-id'];
        if (adminId) {
            await Admin.findOneAndUpdate(
                { $or: [{ _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }, { id: adminId }] },
                { $push: { activityLog: { msg: `Approved and Added ${role || updated.role}: ${updated.name}`, user: 'Admin', date: new Date() } } }
            );
        }

        cache.flushAll();

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const generateReport = async (req, res) => {
    const { adminId, title, content } = req.body;
    try {
        let admin;
        if (mongoose.Types.ObjectId.isValid(adminId)) {
            admin = await Admin.findByIdAndUpdate(adminId, {
                $push: { reports: { title, content, date: new Date() } }
            }, { new: true });
        } else {
            admin = await Admin.findOneAndUpdate({ id: adminId }, {
                $push: { reports: { title, content, date: new Date() } }
            }, { new: true });
        }

        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        
        cache.flushAll();
        res.status(200).json(admin.reports[admin.reports.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAdminDashboard = async (req, res) => {
    try {
        const adminId = req.params.id;
        
        const cacheKey = `admin_dashboard_${adminId}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }

        const [currentAdmin, patients, doctors, caregivers, admins, pendingUsers] = await Promise.all([
            mongoose.Types.ObjectId.isValid(adminId) 
                ? Admin.findById(adminId).select('-image -password') 
                : Admin.findOne({ id: adminId }).select('-image -password'),
            Patient.find({}).select('-image -password'),
            Doctor.find({}).select('-image -password'),
            Caregiver.find({}).select('-image -password'),
            Admin.find({}).select('-image -password'),
            PendingUser.find({}).select('-password')
        ]);

        const allUsers = [
            ...patients.map(p => { 
                const o = p.toObject(); 
                return { 
                    ...o, 
                    id: p.get('id', null, { getters: false }) || o.id, 
                    _id: p._id,
                    name: (p.name || '') + ' ' + (p.lastname || ''), 
                    role: 'Patient', 
                    status: p.status || 'active', 
                    department: 'N/A', 
                    lastActive: p.lastActive || p.updatedAt, 
                    createdAt: p.createdAt 
                }; 
            }),
            ...doctors.map(d => { 
                const o = d.toObject(); 
                return { 
                    ...o, 
                    id: d.get('id', null, { getters: false }) || o.id, 
                    _id: d._id,
                    name: (d.name || '') + ' ' + (d.lastname || ''), 
                    role: 'Doctor', 
                    status: d.status || 'active', 
                    department: d.specialty || 'General', 
                    lastActive: d.lastActive || d.updatedAt, 
                    createdAt: d.createdAt 
                }; 
            }),
            ...caregivers.map(c => { 
                const o = c.toObject(); 
                return { 
                    ...o, 
                    id: c.get('id', null, { getters: false }) || o.id, 
                    _id: c._id,
                    name: (c.name || '') + ' ' + (c.lastname || ''), 
                    role: 'Caregiver', 
                    status: c.status || 'active', 
                    department: 'Home Care', 
                    lastActive: c.lastActive || c.updatedAt, 
                    createdAt: c.createdAt 
                }; 
            }),
            ...admins.map(a => { 
                const o = a.toObject(); 
                return { 
                    ...o, 
                    id: a.get('id', null, { getters: false }) || o.id, 
                    _id: a._id,
                    name: (a.name || '') + ' ' + (a.lastname || ''), 
                    role: 'Admin', 
                    status: a.status || 'active', 
                    department: 'IT', 
                    lastActive: a.lastActive || a.updatedAt, 
                    createdAt: a.createdAt 
                }; 
            }),
            ...pendingUsers.map(u => {
                const o = u.toObject();
                return {
                    ...o,
                    id: o.id || o._id.toString(),
                    _id: o._id,
                    name: (u.name || '') + ' ' + (u.lastname || ''),
                    role: u.role,
                    status: 'pending',
                    department: u.role === 'Doctor' ? (u.specialty || 'General') : 'N/A',
                    lastActive: u.updatedAt,
                    createdAt: u.createdAt
                };
            }),
        ];

        const criticalAlertsCount = await Notification.countDocuments({ type: 'critical', read: false });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trends = {};
        for (let i = 4; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            trends[monthNames[d.getMonth()]] = 0;
        }

        allUsers.forEach(u => {
            if (u.createdAt) {
                const m = monthNames[new Date(u.createdAt).getMonth()];
                if (trends[m] !== undefined) trends[m]++;
            }
        });

        const registrationTrends = Object.keys(trends).map(name => ({ name, val: trends[name] }));

        const stats = {
            totalUsers: allUsers.length,
            patientsCount: patients.length,
            doctorsCount: doctors.length,
            caregiversCount: caregivers.length,
            adminsCount: admins.length,
            criticalAlertsCount,
            registrationTrends
        };

        const responseData = { 
            users: allUsers, 
            stats, 
            reports: (currentAdmin?.reports || []).map(r => ({ title: r.title, content: r.content, date: r.date, _id: r._id })), 
            activityLog: (currentAdmin?.activityLog || []).map(l => ({ msg: l.msg, user: l.user, date: l.date })) 
        };


        if (currentAdmin) {
            try {
                await Admin.findByIdAndUpdate(currentAdmin._id, {
                    $set: { cachedStats: { ...stats, lastUpdated: new Date() } }
                });
            } catch (err) {
                console.error('Failed to update denormalized stats', err);
            }
        }

        // Store in cache for 1 minute (shorter for high-activity areas)
        cache.set(cacheKey, responseData, 60);

        res.status(200).json(responseData);
    } catch (error) {
         res.status(500).json({ message: error.message });
    }
}


const broadcastNotification = async (req, res) => {
    const { targetRole, content, type } = req.body;
    try {
        let targets = [];
        if (targetRole === 'all' || targetRole === 'Patient') targets = [...targets, ...await Patient.find({})];
        if (targetRole === 'all' || targetRole === 'Doctor') targets = [...targets, ...await Doctor.find({})];
        if (targetRole === 'all' || targetRole === 'Caregiver') targets = [...targets, ...await Caregiver.find({})];
        if (targetRole === 'all' || targetRole === 'Admin') targets = [...targets, ...await Admin.find({})];

        const notifications = targets.map(t => ({
            id: `NTF-${Date.now()}-${t.id}`,
            receiverID: t.id,
            content: content,
            type: type || 'info',
            date: new Date(),
            read: false
        }));

        await Notification.insertMany(notifications);
        cache.flushAll();
        res.status(200).json({ message: `Broadcasted to ${targets.length} users` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const broadcastMessage = async (req, res) => {
    const { adminId, targetRole, content } = req.body;
    try {
        let targets = [];
        if (targetRole === 'all' || targetRole === 'Patient') targets = [...targets, ...await Patient.find({})];
        if (targetRole === 'all' || targetRole === 'Doctor') targets = [...targets, ...await Doctor.find({})];
        if (targetRole === 'all' || targetRole === 'Caregiver') targets = [...targets, ...await Caregiver.find({})];
        if (targetRole === 'all' || targetRole === 'Admin') targets = [...targets, ...await Admin.find({})];


        const now = new Date();
        const messages = targets.map(t => ({
            senderID: adminId,
            receiverID: t.id,
            message: content,
            date: now,
            time: now.toLocaleTimeString()
        }));

        await Message.insertMany(messages);
        cache.flushAll();
        res.status(200).json({ message: `Sent messages to ${targets.length} users` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { 
    createAdmin, getAdmins, getAdminById, updateAdmin, deleteAdmin, verifyAdminPassword,
    getAdminDashboard, createUser, deleteUser, updateUser, approveUser, generateReport,
    broadcastNotification, broadcastMessage
};