// services/googleSheets.js

// URL de tu Google Apps Script publicada
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxqfjQVd9sU5Kgeei2ajohdog1xbGr5TedYLwS3U9J0v3Vrb4c0wFZh-zGNSq3jyaIYew/exec';

/**
 * Enviar datos a Google Sheets
 * @param {string} sheetName - El nombre de la hoja (ej. "ventas", "stok de productos")
 * @param {object} data - Los datos que vas a insertar
 */
export const sendToGoogleSheets = async (sheetName, data) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Evita errores de CORS
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheet: sheetName,
        action: 'insert',
        data: data
      })
    });

    console.log('Solicitud enviada a Google Sheets.');
    return true;
  } catch (error) {
    console.error('Error al enviar a Google Sheets:', error);
    return false;
  }
};

/**
 * Obtener datos de Google Sheets
 * @param {string} sheetName - El nombre de la hoja
 */
export const getFromGoogleSheets = async (sheetName) => {
  try {
    const noCacheToken = new Date().getTime();
    const response = await fetch(`${SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}&t=${noCacheToken}`, {
      cache: 'no-store'
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return [];
  }
};

/**
 * Actualizar el estado de pago de una venta en Google Sheets
 */
export const updateSaleStatus = async (rowIndex, newStatus, paymentMethod) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheet: 'Registro de Ventas',
        action: 'update_status',
        rowIndex: rowIndex,
        newStatus: newStatus,
        paymentMethod: paymentMethod || ''
      })
    });
    return true;
  } catch (error) {
    console.error('Error actualizando pago:', error);
    return false;
  }
};
