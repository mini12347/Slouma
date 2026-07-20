import express from 'express';
import { loginUser, registerUser, updateProfile, changePassword, changeEmail, verifyEmail, verifyCode, setPassword } from '../controllers/authController.js';

const routerAuth = express.Router();

routerAuth.post('/login', loginUser);
routerAuth.post('/register', registerUser);
routerAuth.get('/verify-email', verifyEmail);
routerAuth.post('/verify-code', verifyCode);
routerAuth.put('/profile/:id', updateProfile);
routerAuth.put('/change-password/:id', changePassword);
routerAuth.put('/change-email/:id', changeEmail);
routerAuth.post('/set-password', setPassword);

export default routerAuth;
