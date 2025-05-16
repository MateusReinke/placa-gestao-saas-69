
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import VehicleManager from '@/components/vehicles/VehicleManager';

// Mock data for development
const mockVehicles = [
  { 
    id: '1', 
    model: 'Civic', 
    brand: 'Honda', 
    licensePlate: 'ABC-1234', 
    year: '2020', 
    renavam: '1234567890',
    clientId: '1',
    client: {
      id: '1',
      name: 'João Silva'
    }
  },
  { 
    id: '2', 
    model: 'Corolla', 
    brand: 'Toyota', 
    licensePlate: 'DEF-5678', 
    year: '2021', 
    renavam: '0987654321',
    clientId: '2',
    client: {
      id: '2',
      name: 'Maria Oliveira'
    }
  },
  { 
    id: '3', 
    model: 'Renegade', 
    brand: 'Jeep', 
    licensePlate: 'GHI-9012', 
    year: '2022', 
    renavam: '5678901234',
    clientId: '1',
    client: {
      id: '1',
      name: 'João Silva'
    }
  }
];

const AdminVehicles = () => {
  return (
    <AppLayout>
      <VehicleManager initialVehicles={mockVehicles} />
    </AppLayout>
  );
};

export default AdminVehicles;
