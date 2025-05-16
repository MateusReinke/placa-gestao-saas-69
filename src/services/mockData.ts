
import { Client, Order, OrderStatus, ServiceType, Seller, User, DashboardStats } from '@/types';

// Mock service types
export const serviceTypes: ServiceType[] = [
  {
    id: '1',
    name: 'Emplacamento',
    description: 'Serviço de emplacamento de veículos novos',
    active: true
  },
  {
    id: '2',
    name: 'Transferência',
    description: 'Serviço de transferência de propriedade',
    active: true
  },
  {
    id: '3',
    name: 'Segunda Via',
    description: 'Emissão de segunda via da placa',
    active: true
  },
  {
    id: '4',
    name: 'Licenciamento',
    description: 'Renovação do licenciamento anual',
    active: true
  }
];

// Mock order statuses
export const orderStatuses: OrderStatus[] = [
  {
    id: '1',
    name: 'Novo Pedido',
    order: 1,
    color: '#3498db',
    active: true
  },
  {
    id: '2',
    name: 'Analisando Pedido',
    order: 2,
    color: '#f39c12',
    active: true
  },
  {
    id: '3',
    name: 'Enviado Orçamento',
    order: 3,
    color: '#9b59b6',
    active: true
  },
  {
    id: '4',
    name: 'Aguardando Documentação',
    order: 4,
    color: '#e74c3c',
    active: true
  },
  {
    id: '5',
    name: 'Processando Pagamento',
    order: 5,
    color: '#2ecc71',
    active: true
  },
  {
    id: '6',
    name: 'Pendente',
    order: 6,
    color: '#e67e22',
    active: true
  },
  {
    id: '7',
    name: 'Em Andamento',
    order: 7,
    color: '#1abc9c',
    active: true
  },
  {
    id: '8',
    name: 'Concluído',
    order: 8,
    color: '#27ae60',
    active: true
  },
  {
    id: '9',
    name: 'Cancelado',
    order: 9,
    color: '#7f8c8d',
    active: true
  }
];

// Mock sellers data
export const sellers: Seller[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    document: '123.456.789-00',
    phone: '(11) 98765-4321',
    photo: 'https://i.pravatar.cc/150?img=3'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    document: '987.654.321-00',
    phone: '(11) 91234-5678',
    photo: 'https://i.pravatar.cc/150?img=4'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@example.com',
    document: '111.222.333-44',
    phone: '(11) 92222-3333',
    photo: 'https://i.pravatar.cc/150?img=5'
  }
];

// Mock clients data
export const clients: Client[] = [
  {
    id: '1',
    name: 'Pedro Almeida',
    document: '444.555.666-77',
    type: 'physical',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    phone: '(11) 93333-4444',
    email: 'pedro@example.com',
    createdBy: '1' // Created by seller 1
  },
  {
    id: '2',
    name: 'Ana Costa',
    document: '888.999.000-11',
    type: 'physical',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    phone: '(11) 94444-5555',
    email: 'ana@example.com',
    createdBy: '2' // Created by seller 2
  },
  {
    id: '3',
    name: 'Transportes Rápidos Ltda',
    document: '11.222.333/0001-44',
    type: 'juridical',
    address: 'Rod. Anhanguera, KM 30 - Campinas/SP',
    phone: '(19) 95555-6666',
    email: 'contato@transportesrapidos.example.com',
    createdBy: '1' // Created by seller 1
  },
  {
    id: '4',
    name: 'LogTech Logística S.A.',
    document: '22.333.444/0001-55',
    type: 'juridical',
    address: 'Av. Brasil, 500 - Rio de Janeiro/RJ',
    phone: '(21) 96666-7777',
    email: 'contato@logtech.example.com',
    createdBy: '3' // Created by seller 3
  }
];

// Helper function to generate a random license plate
const generateRandomPlate = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const plate = 
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    Math.floor(Math.random() * 10) +
    String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10);
  return plate;
};

// Generate mock orders
export const generateMockOrders = (count: number): Order[] => {
  const orders: Order[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomClientIndex = Math.floor(Math.random() * clients.length);
    const randomStatusIndex = Math.floor(Math.random() * orderStatuses.length);
    const randomServiceIndex = Math.floor(Math.random() * serviceTypes.length);
    const randomSellerIndex = Math.floor(Math.random() * sellers.length);
    const randomValue = Math.floor(Math.random() * 1000) + 500; // Random value between 500 and 1500
    
    // Random date within the last 6 months
    const randomDate = new Date();
    randomDate.setMonth(randomDate.getMonth() - Math.floor(Math.random() * 6));
    
    orders.push({
      id: String(i + 1),
      clientId: clients[randomClientIndex].id,
      client: clients[randomClientIndex],
      createdBy: sellers[randomSellerIndex].id,
      seller: {
        id: sellers[randomSellerIndex].id,
        name: sellers[randomSellerIndex].name,
        email: sellers[randomSellerIndex].email,
        role: 'seller',
        phone: sellers[randomSellerIndex].phone,
        document: sellers[randomSellerIndex].document,
        photo: sellers[randomSellerIndex].photo
      },
      serviceTypeId: serviceTypes[randomServiceIndex].id,
      serviceType: serviceTypes[randomServiceIndex],
      statusId: orderStatuses[randomStatusIndex].id,
      status: orderStatuses[randomStatusIndex],
      licensePlate: generateRandomPlate(),
      value: randomValue,
      createdAt: randomDate.toISOString()
    });
  }
  
  return orders;
};

// Mock initial orders
export const orders: Order[] = generateMockOrders(30);

// Generate mock dashboard stats
export const generateMockDashboardStats = (userRole: 'admin' | 'seller' | 'physical' | 'juridical', userId?: string): DashboardStats => {
  // Filter orders based on user role
  let filteredOrders = [...orders];
  
  if (userRole === 'seller' && userId) {
    filteredOrders = orders.filter(order => order.createdBy === userId || clients.find(c => c.id === order.clientId)?.createdBy === userId);
  } else if ((userRole === 'physical' || userRole === 'juridical') && userId) {
    // For clients, just show their own orders
    filteredOrders = orders.filter(order => order.client?.id === userId);
  }
  
  // Total orders
  const totalOrders = filteredOrders.length;
  
  // Monthly revenue (sum of all orders within the current month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyRevenue = filteredOrders
    .filter(order => {
      const date = new Date(order.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, order) => sum + order.value, 0);
  
  // Orders by status
  const ordersByStatus = orderStatuses
    .map(status => {
      const count = filteredOrders.filter(order => order.statusId === status.id).length;
      return { statusName: status.name, count };
    })
    .filter(item => item.count > 0);
  
  // Orders by service type
  const ordersByServiceType = serviceTypes
    .map(type => {
      const count = filteredOrders.filter(order => order.serviceTypeId === type.id).length;
      return { serviceName: type.name, count };
    })
    .filter(item => item.count > 0);
  
  // Orders by month (last 6 months)
  const ordersByMonth = Array.from({ length: 6 }, (_, i) => {
    const month = new Date(currentYear, currentMonth - i, 1);
    const monthName = month.toLocaleString('default', { month: 'short' });
    
    const count = filteredOrders.filter(order => {
      const date = new Date(order.createdAt);
      return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    }).length;
    
    return { month: monthName, count };
  }).reverse();
  
  return {
    totalOrders,
    monthlyRevenue,
    ordersByStatus,
    ordersByServiceType,
    ordersByMonth
  };
};
