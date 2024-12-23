// services/socketService.js

import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL; // Update this with your backend API URL
const socket = io(API_URL ); // Remplacez par l'URL de votre serveur Node.js où Socket.io est configuré

export default socket;
