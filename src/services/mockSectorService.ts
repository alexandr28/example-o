// src/services/mockSectorService.ts
import { Sector, SectorFormData } from '../models/Sector';

// Simular almacenamiento local persistente
const STORAGE_KEY = 'mock_sectores_data';

// Función para cargar datos desde localStorage
const loadMockData = (): Sector[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error al cargar datos mock del localStorage:', error);
  }
  
  // Datos iniciales si no hay nada en localStorage
  return [
    { id: 1, nombre: 'SECTOR JERUSALÉN' },
    { id: 2, nombre: 'URB. MANUEL ARÉVALO II' },
    { id: 3, nombre: 'PARQUE INDUSTRIAL' },
    { id: 4, nombre: 'SECTOR CENTRAL' },
    { id: 5, nombre: 'LOS JARDINES' },
  ];
};

// Función para guardar datos en localStorage
const saveMockData = (data: Sector[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar datos mock en localStorage:', error);
  }
};

// Inicializar data
let sectoresMock = loadMockData();

// Simulación de retardo para simular latencia de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockSectorService = {
  // Obtener todos los sectores
  getAll: async (): Promise<Sector[]> => {
    await delay(500); // Simular latencia
    return [...sectoresMock];
  },
  
  // Obtener un sector por ID
  getById: async (id: number): Promise<Sector | null> => {
    await delay(300);
    return sectoresMock.find(s => s.id === id) || null;
  },
  
  // Crear un nuevo sector
  create: async (data: SectorFormData): Promise<Sector> => {
    await delay(600);
    const newSector: Sector = {
      id: Math.max(0, ...sectoresMock.map(s => s.id)) + 1,
      ...data
    };
    sectoresMock.push(newSector);
    saveMockData(sectoresMock);
    return newSector;
  },
  
  // Actualizar un sector existente
  update: async (id: number, data: SectorFormData): Promise<Sector> => {
    await delay(500);
    const index = sectoresMock.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Sector con ID ${id} no encontrado`);
    }
    
    const updatedSector = {
      ...sectoresMock[index],
      ...data
    };
    
    sectoresMock[index] = updatedSector;
    saveMockData(sectoresMock);
    return updatedSector;
  },
  
  // Eliminar un sector
  delete: async (id: number): Promise<void> => {
    await delay(400);
    const index = sectoresMock.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Sector con ID ${id} no encontrado`);
    }
    
    sectoresMock.splice(index, 1);
    saveMockData(sectoresMock);
  }
};