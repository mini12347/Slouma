import mongoose from "mongoose";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Caregiver from "../models/caregiver.js";
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

        const updated = await doc.save();

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
        if (role === 'Patient') deleted = await Patient.findOneAndDelete(query);
        else if (role === 'Doctor') deleted = await Doctor.findOneAndDelete(query);
        else if (role === 'Caregiver') deleted = await Caregiver.findOneAndDelete(query);
        else if (role === 'Admin') deleted = await Admin.findOneAndDelete(query);
        else return res.status(400).json({ message: `Invalid role: ${role}` });
        
        if (!deleted) return res.status(404).json({ message: 'User not found' });

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
        
        if (!updated) return res.status(404).json({ message: 'User not found' });

        // Create Approval Notification
        const approvalNotification = new Notification({
            id: `NTF-APPROVE-${Date.now()}-${updated.id}`,
            receiverID: updated.id,
            content: `Congratulations! Your account as a ${role} has been approved by the administrator. You can now log in.`,
            type: 'success',
            date: new Date(),
            read: false
        });
        await approvalNotification.save();

        // Invalidate cache and log activity
        const adminId = req.headers['x-admin-id'];
        if (adminId) {
            await Admin.findOneAndUpdate(
                { $or: [{ _id: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null }, { id: adminId }] },
                { $push: { activityLog: { msg: `Approved ${role}: ${updated.name}`, user: 'Admin', date: new Date() } } }
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

        const [currentAdmin, patients, doctors, caregivers, admins] = await Promise.all([
            mongoose.Types.ObjectId.isValid(adminId) 
                ? Admin.findById(adminId).select('-image -password') 
                : Admin.findOne({ id: adminId }).select('-image -password'),
            Patient.find({}).select('-image -password'),
            Doctor.find({}).select('-image -password'),
            Caregiver.find({}).select('-image -password'),
            Admin.find({}).select('-image -password')
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