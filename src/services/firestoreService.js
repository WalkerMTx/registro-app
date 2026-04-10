// services/firestoreService.js - Todas las operaciones de base de datos
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  increment,
  where,
  serverTimestamp
} from 'firebase/firestore';

// ======================== PRODUCTOS ========================

/**
 * Obtener todos los productos (lectura única)
 */
export const getProducts = async () => {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('name')));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Escuchar productos en tiempo real
 */
export const subscribeProducts = (callback) => {
  const q = query(collection(db, 'products'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

/**
 * Agregar un producto nuevo
 */
export const addProduct = async (product) => {
  return await addDoc(collection(db, 'products'), {
    name: product.name,
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    createdAt: serverTimestamp()
  });
};

/**
 * Actualizar un producto
 */
export const updateProduct = async (productId, data) => {
  return await updateDoc(doc(db, 'products', productId), data);
};

/**
 * Ingresar stock (sumar) a un producto
 */
export const addStock = async (productId, quantity) => {
  return await updateDoc(doc(db, 'products', productId), {
    stock: increment(Number(quantity))
  });
};

/**
 * Restar stock de un producto
 */
export const subtractStock = async (productId, quantity) => {
  return await updateDoc(doc(db, 'products', productId), {
    stock: increment(-Number(quantity))
  });
};

// ======================== VENTAS ========================

/**
 * Escuchar ventas en tiempo real (ordenadas por fecha, más recientes primero)
 */
export const subscribeSales = (callback) => {
  const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

/**
 * Registrar una venta
 */
export const addSale = async (sale, productId) => {
  // 1. Guardar la venta
  const saleDoc = await addDoc(collection(db, 'sales'), {
    client: sale.client,
    product: sale.product,
    quantity: Number(sale.quantity),
    status: sale.status,
    method: sale.paymentMethod || '',
    createdAt: serverTimestamp()
  });

  // 2. Restar stock automáticamente
  if (productId) {
    await subtractStock(productId, sale.quantity);
  }

  return saleDoc;
};

/**
 * Cobrar una deuda (cambiar PENDIENTE -> PAGO + método)
 */
export const confirmPayment = async (saleId, paymentMethod) => {
  return await updateDoc(doc(db, 'sales', saleId), {
    status: 'PAGO',
    method: paymentMethod
  });
};

// ======================== SERVICIOS ========================

/**
 * Obtener lista de servicios disponibles
 */
export const getServicesList = async () => {
  const snap = await getDocs(collection(db, 'servicesList'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Escuchar servicios disponibles en tiempo real
 */
export const subscribeServicesList = (callback) => {
  return onSnapshot(collection(db, 'servicesList'), (snap) => {
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

/**
 * Registrar un servicio realizado
 */
export const addServiceLog = async (service) => {
  return await addDoc(collection(db, 'servicesLog'), {
    serviceName: service.serviceName,
    price: Number(service.price) || 0,
    client: service.client,
    technician: service.technician || '',
    notes: service.notes || '',
    createdAt: serverTimestamp()
  });
};
