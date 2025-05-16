
interface Brand {
  code: string;
  name: string;
}

interface Model {
  code: string;
  name: string;
  brand: string;
}

interface Year {
  code: string;
  name: string;
  model: string;
}

// Dados simulados para marcas de veículos
export const vehicleBrands: Brand[] = [
  { code: 'chevrolet', name: 'Chevrolet' },
  { code: 'volkswagen', name: 'Volkswagen' },
  { code: 'fiat', name: 'Fiat' },
  { code: 'toyota', name: 'Toyota' },
  { code: 'honda', name: 'Honda' },
  { code: 'hyundai', name: 'Hyundai' },
  { code: 'ford', name: 'Ford' },
  { code: 'renault', name: 'Renault' },
  { code: 'bmw', name: 'BMW' },
  { code: 'mercedes', name: 'Mercedes-Benz' },
  { code: 'audi', name: 'Audi' },
  { code: 'nissan', name: 'Nissan' },
  { code: 'jeep', name: 'Jeep' },
  { code: 'mitsubishi', name: 'Mitsubishi' },
  { code: 'peugeot', name: 'Peugeot' },
  { code: 'citroen', name: 'Citroen' },
  { code: 'kia', name: 'Kia' },
  { code: 'land-rover', name: 'Land Rover' },
  { code: 'subaru', name: 'Subaru' },
  { code: 'volvo', name: 'Volvo' },
];

// Modelos de veículos para cada marca
export const vehicleModels: Model[] = [
  // Chevrolet
  { code: 'onix', name: 'Onix', brand: 'chevrolet' },
  { code: 'prisma', name: 'Prisma', brand: 'chevrolet' },
  { code: 'cruze', name: 'Cruze', brand: 'chevrolet' },
  { code: 's10', name: 'S10', brand: 'chevrolet' },
  { code: 'tracker', name: 'Tracker', brand: 'chevrolet' },
  
  // Volkswagen
  { code: 'gol', name: 'Gol', brand: 'volkswagen' },
  { code: 'fox', name: 'Fox', brand: 'volkswagen' },
  { code: 'polo', name: 'Polo', brand: 'volkswagen' },
  { code: 'virtus', name: 'Virtus', brand: 'volkswagen' },
  { code: 't-cross', name: 'T-Cross', brand: 'volkswagen' },
  
  // Fiat
  { code: 'uno', name: 'Uno', brand: 'fiat' },
  { code: 'argo', name: 'Argo', brand: 'fiat' },
  { code: 'toro', name: 'Toro', brand: 'fiat' },
  { code: 'strada', name: 'Strada', brand: 'fiat' },
  { code: 'pulse', name: 'Pulse', brand: 'fiat' },
  
  // Toyota
  { code: 'corolla', name: 'Corolla', brand: 'toyota' },
  { code: 'hilux', name: 'Hilux', brand: 'toyota' },
  { code: 'sw4', name: 'SW4', brand: 'toyota' },
  { code: 'yaris', name: 'Yaris', brand: 'toyota' },
  { code: 'etios', name: 'Etios', brand: 'toyota' },
  
  // Honda
  { code: 'civic', name: 'Civic', brand: 'honda' },
  { code: 'fit', name: 'Fit', brand: 'honda' },
  { code: 'hr-v', name: 'HR-V', brand: 'honda' },
  { code: 'wr-v', name: 'WR-V', brand: 'honda' },
  { code: 'city', name: 'City', brand: 'honda' },
];

// Anos disponíveis para cada modelo
export const vehicleYears: Year[] = [
  // Onix
  { code: 'onix-2023', name: '2023', model: 'onix' },
  { code: 'onix-2022', name: '2022', model: 'onix' },
  { code: 'onix-2021', name: '2021', model: 'onix' },
  { code: 'onix-2020', name: '2020', model: 'onix' },
  
  // Gol
  { code: 'gol-2023', name: '2023', model: 'gol' },
  { code: 'gol-2022', name: '2022', model: 'gol' },
  { code: 'gol-2021', name: '2021', model: 'gol' },
  { code: 'gol-2020', name: '2020', model: 'gol' },
  
  // Para cada modelo, vamos adicionar anos de 2020 a 2023
  // Adicionando para todos os modelos Chevrolet
  { code: 'prisma-2023', name: '2023', model: 'prisma' },
  { code: 'prisma-2022', name: '2022', model: 'prisma' },
  { code: 'prisma-2021', name: '2021', model: 'prisma' },
  { code: 'prisma-2020', name: '2020', model: 'prisma' },
  
  { code: 'cruze-2023', name: '2023', model: 'cruze' },
  { code: 'cruze-2022', name: '2022', model: 'cruze' },
  { code: 'cruze-2021', name: '2021', model: 'cruze' },
  { code: 'cruze-2020', name: '2020', model: 'cruze' },
];

// Função para obter marcas de veículos
export const getBrands = async (): Promise<Brand[]> => {
  // Simulando uma chamada de API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(vehicleBrands);
    }, 300);
  });
};

// Função para obter modelos por marca
export const getModelsByBrand = async (brandCode: string): Promise<Model[]> => {
  // Simulando uma chamada de API
  return new Promise((resolve) => {
    setTimeout(() => {
      const models = vehicleModels.filter(model => model.brand === brandCode);
      resolve(models);
    }, 300);
  });
};

// Função para obter anos por modelo
export const getYearsByModel = async (modelCode: string): Promise<Year[]> => {
  // Simulando uma chamada de API
  return new Promise((resolve) => {
    setTimeout(() => {
      const years = vehicleYears.filter(year => year.model === modelCode);
      if (years.length === 0) {
        // Se não encontrarmos anos específicos para o modelo, retornamos anos padrão
        resolve([
          { code: `${modelCode}-2023`, name: '2023', model: modelCode },
          { code: `${modelCode}-2022`, name: '2022', model: modelCode },
          { code: `${modelCode}-2021`, name: '2021', model: modelCode },
          { code: `${modelCode}-2020`, name: '2020', model: modelCode }
        ]);
      } else {
        resolve(years);
      }
    }, 300);
  });
};
