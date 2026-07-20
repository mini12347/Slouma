import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Caregiver from '../models/caregiver.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      const models = [Admin, Doctor, Patient, Caregiver];
      let user = null;

      for (const Model of models) {
        user = await Model.findById(decoded.id).select('-password');
        if (user) {
          user.role = Model.modelName.toLowerCase();
          break;
        }
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ message: 'Account is not active' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };
