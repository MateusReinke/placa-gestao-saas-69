import { 
  clients,
  sellers,
  orders,
  serviceTypes,
  orderStatuses,
  generateMockDashboardStats
} from './mockData';
import { 
  Client, 
  Order, 
  OrderStatus, 
  ServiceType, 
  Seller, 
  DashboardStats,
  UserRole,
  Vehicle 
} from '@/types';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for vehicles
const vehicles: Vehicle[] = [
  {
    id: '1',
    licensePlate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: '2020',
    color: 'Prata',
    clientId: '1'
  },
  {
    id: '2',
    licensePlate: 'DEF5678',
    brand: 'Honda',
    model: 'Civic',
    year: '2019',
    color: 'Preto',
    clientId: '2'
  },
  {
    id: '3',
    licensePlate: 'GHI9012',
    brand: 'Volkswagen',
    model: 'Golf',
    year: '2021',
    color: 'Branco',
    clientId: '3'
  },
  {
    id: '4',
    licensePlate: 'JKL3456',
    brand: 'Ford',
    model: 'Focus',
    year: '2018',
    color: 'Azul',
    clientId: '1'
  }
];

// API Service class
export class ApiService {
  // Clients
  static async getClients(userId?: string, userRole?: UserRole): Promise<Client[]> {
    await delay(500);
    
    if (userRole === 'seller' && userId) {
      return clients.filter(client => client.createdBy === userId);
    }
    
    return clients;
  }
  
  static async getClient(id: string): Promise<Client | undefined> {
    await delay(300);
    return clients.find(client => client.id === id);
  }
  
  static async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    await delay(500);
    const newClient = {
      ...client,
      id: (clients.length + 1).toString()
    };
    clients.push(newClient);
    return newClient;
  }
  
  static async updateClient(id: string, updatedClient: Partial<Client>): Promise<Client | undefined> {
    await delay(500);
    const index = clients.findIndex(client => client.id === id);
    
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updatedClient };
      return clients[index];
    }
    
    return undefined;
  }
  
  static async deleteClient(id: string): Promise<boolean> {
    await delay(500);
    const index = clients.findIndex(client => client.id === id);
    
    if (index !== -1) {
      clients.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Sellers (admin only)
  static async getSellers(): Promise<Seller[]> {
    await delay(500);
    return sellers;
  }
  
  static async getSeller(id: string): Promise<Seller | undefined> {
    await delay(300);
    return sellers.find(seller => seller.id === id);
  }
  
  static async createSeller(seller: Omit<Seller, 'id'>): Promise<Seller> {
    await delay(500);
    const newSeller = {
      ...seller,
      id: (sellers.length + 1).toString()
    };
    sellers.push(newSeller);
    return newSeller;
  }
  
  static async updateSeller(id: string, updatedSeller: Partial<Seller>): Promise<Seller | undefined> {
    await delay(500);
    const index = sellers.findIndex(seller => seller.id === id);
    
    if (index !== -1) {
      sellers[index] = { ...sellers[index], ...updatedSeller };
      return sellers[index];
    }
    
    return undefined;
  }
  
  static async deleteSeller(id: string): Promise<boolean> {
    await delay(500);
    const index = sellers.findIndex(seller => seller.id === id);
    
    if (index !== -1) {
      sellers.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Orders
  static async getOrders(userId?: string, userRole?: UserRole): Promise<Order[]> {
    await delay(500);
    
    if (!userId || !userRole) return orders;
    
    // Admin sees all orders
    if (userRole === 'admin') return orders;
    
    // Sellers see orders they created or orders from their clients
    if (userRole === 'seller') {
      return orders.filter(order => 
        order.createdBy === userId || 
        clients.find(c => c.id === order.clientId)?.createdBy === userId
      );
    }
    
    // Clients only see their own orders
    if (userRole === 'physical' || userRole === 'juridical') {
      const userClients = clients.filter(client => client.id === userId);
      return orders.filter(order => userClients.some(c => c.id === order.clientId));
    }
    
    return [];
  }
  
  static async getOrder(id: string): Promise<Order | undefined> {
    await delay(300);
    return orders.find(order => order.id === id);
  }
  
  static async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    await delay(500);
    
    // Find related entities
    const client = clients.find(c => c.id === order.clientId);
    const serviceType = serviceTypes.find(s => s.id === order.serviceTypeId);
    const status = orderStatuses.find(s => s.id === order.statusId);
    
    // Create new order with relationships
    const newOrder: Order = {
      ...order,
      id: (orders.length + 1).toString(),
      createdAt: new Date().toISOString(),
      client,
      serviceType,
      status
    };
    
    orders.push(newOrder);
    return newOrder;
  }
  
  static async updateOrder(id: string, updatedOrder: Partial<Order>): Promise<Order | undefined> {
    await delay(500);
    const index = orders.findIndex(order => order.id === id);
    
    if (index !== -1) {
      // Find related entities if they were updated
      let client = orders[index].client;
      let serviceType = orders[index].serviceType;
      let status = orders[index].status;
      
      if (updatedOrder.clientId) {
        client = clients.find(c => c.id === updatedOrder.clientId);
      }
      
      if (updatedOrder.serviceTypeId) {
        serviceType = serviceTypes.find(s => s.id === updatedOrder.serviceTypeId);
      }
      
      if (updatedOrder.statusId) {
        status = orderStatuses.find(s => s.id === updatedOrder.statusId);
      }
      
      orders[index] = { 
        ...orders[index], 
        ...updatedOrder,
        client,
        serviceType,
        status
      };
      
      return orders[index];
    }
    
    return undefined;
  }
  
  static async deleteOrder(id: string): Promise<boolean> {
    await delay(500);
    const index = orders.findIndex(order => order.id === id);
    
    if (index !== -1) {
      orders.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Service Types (admin only)
  static async getServiceTypes(): Promise<ServiceType[]> {
    await delay(300);
    return serviceTypes;
  }
  
  static async createServiceType(serviceType: Omit<ServiceType, 'id'>): Promise<ServiceType> {
    await delay(300);
    const newServiceType = {
      ...serviceType,
      id: (serviceTypes.length + 1).toString()
    };
    serviceTypes.push(newServiceType);
    return newServiceType;
  }
  
  static async updateServiceType(id: string, updatedServiceType: Partial<ServiceType>): Promise<ServiceType | undefined> {
    await delay(300);
    const index = serviceTypes.findIndex(type => type.id === id);
    
    if (index !== -1) {
      serviceTypes[index] = { ...serviceTypes[index], ...updatedServiceType };
      return serviceTypes[index];
    }
    
    return undefined;
  }
  
  static async deleteServiceType(id: string): Promise<boolean> {
    await delay(300);
    const index = serviceTypes.findIndex(type => type.id === id);
    
    if (index !== -1) {
      serviceTypes.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Order Statuses (admin only)
  static async getOrderStatuses(): Promise<OrderStatus[]> {
    await delay(300);
    return orderStatuses;
  }
  
  static async createOrderStatus(orderStatus: Omit<OrderStatus, 'id'>): Promise<OrderStatus> {
    await delay(300);
    const newOrderStatus = {
      ...orderStatus,
      id: (orderStatuses.length + 1).toString()
    };
    orderStatuses.push(newOrderStatus);
    return newOrderStatus;
  }
  
  static async updateOrderStatus(id: string, updatedOrderStatus: Partial<OrderStatus>): Promise<OrderStatus | undefined> {
    await delay(300);
    const index = orderStatuses.findIndex(status => status.id === id);
    
    if (index !== -1) {
      orderStatuses[index] = { ...orderStatuses[index], ...updatedOrderStatus };
      return orderStatuses[index];
    }
    
    return undefined;
  }
  
  static async deleteOrderStatus(id: string): Promise<boolean> {
    await delay(300);
    const index = orderStatuses.findIndex(status => status.id === id);
    
    if (index !== -1) {
      orderStatuses.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Dashboard
  static async getDashboardStats(userId: string, userRole: UserRole): Promise<DashboardStats> {
    await delay(800);
    return generateMockDashboardStats(userRole, userId);
  }
  
  // Vehicles
  static async getClientVehicles(clientId: string): Promise<Vehicle[]> {
    await delay(300);
    return vehicles.filter(vehicle => vehicle.clientId === clientId);
  }
  
  static async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    await delay(300);
    const newVehicle = {
      ...vehicle,
      id: (vehicles.length + 1).toString()
    };
    vehicles.push(newVehicle);
    return newVehicle;
  }
  
  static async getVehicleByLicensePlate(licensePlate: string): Promise<Vehicle | undefined> {
    await delay(300);
    return vehicles.find(vehicle => vehicle.licensePlate === licensePlate);
  }
  
  static async updateVehicle(id: string, updatedVehicle: Partial<Vehicle>): Promise<Vehicle | undefined> {
    await delay(300);
    const index = vehicles.findIndex(vehicle => vehicle.id === id);
    
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...updatedVehicle };
      return vehicles[index];
    }
    
    return undefined;
  }
  
  static async deleteVehicle(id: string): Promise<boolean> {
    await delay(300);
    const index = vehicles.findIndex(vehicle => vehicle.id === id);
    
    if (index !== -1) {
      vehicles.splice(index, 1);
      return true;
    }
    
    return false;
  }
}
