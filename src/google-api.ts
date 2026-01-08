import { Router } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'node:path';

// Load env from src/key.env (keeps credentials out of process env during development)
dotenv.config({ path: path.join(process.cwd(), 'src', 'key.env') });

const router = Router();
const TOKEN_PATH = path.join(process.cwd(), 'google_tokens.json');

console.log('GOOGLE_CLIENT_ID=', process.env['GOOGLE_CLIENT_ID']);
console.log('GOOGLE_REDIRECT_URI=', process.env['GOOGLE_REDIRECT_URI']);

const oAuth2Client = new google.auth.OAuth2(
  process.env['GOOGLE_CLIENT_ID'],
  process.env['GOOGLE_CLIENT_SECRET'],
  process.env['GOOGLE_REDIRECT_URI'],
);

router.get('/api/google/auth', (_req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
  res.json({ url });
});

router.get('/api/google/oauth2callback', async (req, res) => {
  try {
    const code = String(req.query['code'] || '');
    if (!code) return res.status(400).send('Missing code');
    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
    return res.send('Autorización completada. Puedes cerrar esta ventana.');
  } catch (err) {
    console.error('oauth2callback error', err);
    return res.status(500).send('Error en intercambio de código.');
  }
});

router.post('/api/registers', async (req, res) => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(400).json({ error: 'No autorizado. Ejecuta /api/google/auth y autoriza primero.' });
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const payload = req.body;
    
    // Estructura de datos para visitantes: fecha, horaEntrada, nombre, cedula, empresa, correo, area, servicio, carnetVisita, horaSalida
    const rows = Array.isArray(payload)
      ? payload.map((p: any) => [
          p.fecha || new Date().toISOString(),
          p.horaEntrada || '',
          p.nombre || '',
          p.cedula || '',
          p.empresa || '',
          p.correo || '',
          p.area || '',
          p.servicio || '',
          p.carnetVisita || '',
          p.horaSalida || '',
        ])
      : [[
          payload.fecha || new Date().toISOString(),
          payload.horaEntrada || '',
          payload.nombre || '',
          payload.cedula || '',
          payload.empresa || '',
          payload.correo || '',
          payload.area || '',
          payload.servicio || '',
          payload.carnetVisita || '',
          payload.horaSalida || '',
        ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env['SPREADSHEET_ID']!,
      range: 'Registro!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('registers append error', err);
    return res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
});

router.get('/api/visitors/:cedula', async (req, res) => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(400).json({ error: 'No autorizado. Ejecuta /api/google/auth y autoriza primero.' });
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const cedula = req.params.cedula;

    // Leer todas las filas de la hoja
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env['SPREADSHEET_ID']!,
      range: 'Registro!A:J',
    });

    const rows = response.data.values || [];
    
    // Buscar la fila con la cédula (columna D, índice 3)
    const visitorRow = rows.find((row) => row[3] === cedula);

    if (!visitorRow) {
      return res.status(404).json({ error: 'Visitante no encontrado' });
    }

    // Retornar datos estructurados
    const visitor = {
      fecha: visitorRow[0] || '',
      horaEntrada: visitorRow[1] || '',
      nombre: visitorRow[2] || '',
      cedula: visitorRow[3] || '',
      empresa: visitorRow[4] || '',
      correo: visitorRow[5] || '',
      area: visitorRow[6] || '',
      servicio: visitorRow[7] || '',
      carnetVisita: visitorRow[8] || '',
      horaSalida: visitorRow[9] || '',
    };

    return res.json(visitor);
  } catch (err) {
    console.error('visitor fetch error', err);
    return res.status(500).json({ error: 'Error al buscar visitante en Sheets' });
  }
});

router.patch('/api/visitors', async (req, res) => {
  try {
    if (!fs.existsSync(TOKEN_PATH)) {
      return res.status(400).json({ error: 'No autorizado. Ejecuta /api/google/auth y autoriza primero.' });
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    const { cedula, horaSalida } = req.body;

    if (!cedula || !horaSalida) {
      return res.status(400).json({ error: 'cedula y horaSalida son requeridos' });
    }

    // Leer todas las filas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env['SPREADSHEET_ID']!,
      range: 'Registro!A:J',
    });

    const rows = response.data.values || [];
    
    // Buscar el índice de la fila con la cédula (columna D, índice 3)
    const rowIndex = rows.findIndex((row) => row[3] === cedula);

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Visitante no encontrado' });
    }

    // Actualizar la columna J (horaSalida) en esa fila (índice 9)
    const actualRowNumber = rowIndex + 1; // +1 porque las filas en Sheets empiezan en 1
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env['SPREADSHEET_ID']!,
      range: `Registro!J${actualRowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[horaSalida]],
      },
    });

    return res.json({ ok: true, message: 'Hora de salida actualizada' });
  } catch (err) {
    console.error('visitor update error', err);
    return res.status(500).json({ error: 'Error al actualizar visitante en Sheets' });
  }
});

export default router;