
# Documentação do Projeto VehiclePlate

## Visão Geral

O VehiclePlate é um sistema de gestão para empresas de emplacamento veicular, permitindo o controle de pedidos, clientes, veículos, estoque e vendedores.

## Estrutura do Projeto

### Tecnologias Utilizadas
- **React**: Framework front-end
- **Typescript**: Tipagem estática para JavaScript
- **React Router Dom**: Roteamento
- **Tailwind CSS**: Framework CSS para estilização
- **Shadcn UI**: Componentes de UI
- **Vite**: Build tool e dev server
- **React Query**: Gerenciamento de estado e requisições
- **Recharts**: Biblioteca para visualização de dados

### Estrutura de Arquivos

```
src/
├── components/         # Componentes reutilizáveis
│   ├── forms/          # Formulários
│   ├── layouts/        # Layouts comuns (AppLayout)
│   └── ui/             # Componentes de UI (botões, inputs, etc.)
├── contexts/           # Contextos React (AuthContext)
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades e funções helpers
├── pages/              # Páginas da aplicação
│   ├── admin/          # Páginas de administração
│   ├── clientes/       # Páginas para clientes
│   └── vendedor/       # Páginas para vendedores
├── services/           # Serviços e APIs
├── styles/             # Estilos globais
└── types/              # Definições de tipos TypeScript
```

## Autenticação e Autorização

O sistema utiliza um fluxo de autenticação baseado em JWT (simulado) com diferentes níveis de acesso:

### Tipos de Usuários
- **Admin**: Acesso completo ao sistema
- **Seller (Vendedor)**: Acesso às funcionalidades de vendas
- **Physical (Cliente Físico)**: Cliente pessoa física
- **Juridical (Cliente Jurídico)**: Cliente pessoa jurídica

### Fluxo de Autenticação
1. O usuário acessa a página de login
2. Após o login bem-sucedido, o token e os dados do usuário são armazenados no localStorage
3. O sistema redireciona o usuário para o dashboard apropriado de acordo com seu perfil
4. Rotas protegidas verificam a autenticação e o tipo de usuário antes de permitir acesso

## Módulos do Sistema

### Dashboard
- **Visão geral**: Estatísticas e métricas
- **Gráficos**: Volume de pedidos, distribuição por tipo de serviço e status
- **Cards de estatísticas**: Total de pedidos, faturamento e processos ativos

### Pedidos
- **Listagem de pedidos**: Visualização em formato de tabela
- **Filtros**: Por cliente, status e tipo de serviço
- **Kanban**: Visualização de pedidos em formato Kanban por status
- **Cores de status**: Indicação visual do estado de cada pedido

### Clientes
- **Cadastro**: Registro de clientes físicos e jurídicos
- **Listagem**: Visualização e filtro de clientes
- **Histórico**: Pedidos associados a cada cliente

### Veículos
- **Cadastro**: Registro de veículos associados aos clientes
- **Listagem**: Visualização de veículos com filtros
- **Detalhes**: Informações como placa, modelo e proprietário

### Estoque
- **Controle de itens**: Monitoramento de quantidade, preço de custo
- **Status de estoque**: Adequado, baixo, crítico
- **Movimentações**: Entrada e saída de itens do estoque

### Vendedores (Apenas Admin)
- **Cadastro**: Registro de novos vendedores
- **Desempenho**: Acompanhamento de métricas de vendas

### Serviços (Apenas Admin)
- **Configuração**: Tipos de serviços oferecidos
- **Preços**: Definição de valores para cada serviço
- **Ativação/Desativação**: Controle de serviços disponíveis

## Tipos de Dados

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'physical' | 'juridical';
  phone?: string;
  document?: string;
  photo?: string;
}
```

### Client
```typescript
interface Client {
  id: string;
  name: string;
  document: string;
  type: 'physical' | 'juridical';
  address?: string;
  phone?: string;
  email?: string;
  createdBy: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  clientId: string;
  client?: Client;
  createdBy: string;
  seller?: User;
  serviceTypeId: string;
  serviceType?: ServiceType;
  statusId: string;
  status?: OrderStatus;
  licensePlate: string;
  value: number;
  createdAt: string;
}
```

### InventoryItem
```typescript
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  category: string;
  status: 'adequate' | 'low' | 'critical';
}
```

## Rotas da Aplicação

### Rotas Públicas
- `/login`: Página de login

### Rotas de Administrador
- `/admin/dashboard`: Dashboard administrativo
- `/admin/services`: Gerenciamento de serviços
- `/admin/orders`: Gerenciamento de pedidos
- `/admin/clients`: Gerenciamento de clientes
- `/admin/sellers`: Gerenciamento de vendedores
- `/admin/inventory`: Gerenciamento de estoque
- `/admin/settings`: Configurações administrativas
- `/admin/vehicles`: Gerenciamento de veículos

### Rotas de Vendedor
- `/seller/dashboard`: Dashboard do vendedor
- `/seller/orders`: Gerenciamento de pedidos
- `/seller/clients`: Gerenciamento de clientes
- `/seller/inventory`: Visualização de estoque
- `/seller/settings`: Configurações do vendedor

### Rotas de Cliente
- `/client/dashboard`: Dashboard do cliente
- `/client/orders`: Visualização de pedidos
- `/client/vehicles`: Gerenciamento de veículos

## Fluxos de Trabalho

### Criação de Pedido
1. Vendedor seleciona um cliente ou cria um novo
2. Seleciona o tipo de serviço
3. Insere as informações do veículo (placa)
4. Define o valor do serviço
5. Submete o pedido, que inicia com status "Novo"

### Acompanhamento de Pedido
1. O pedido passa por diferentes status: Novo → Em andamento → Finalizado
2. Em cada etapa, o sistema permite adicionar novas informações
3. O cliente pode acompanhar o andamento de seus pedidos

### Gerenciamento de Estoque
1. Administrador cadastra itens no estoque
2. Define quantidade mínima para alertas
3. Registra movimentações de entrada e saída
4. Visualiza alertas de itens com estoque baixo ou crítico

## Comportamentos Específicos

### Redirecionamento após Login
- Administrador é redirecionado para `/admin/dashboard`
- Vendedor é redirecionado para `/seller/dashboard`
- Cliente é redirecionado para `/client/dashboard`

### Proteção de Rotas
- Rotas `/admin/*` são acessíveis apenas por usuários com perfil "admin"
- Rotas `/seller/*` são acessíveis por usuários com perfil "admin" ou "seller"
- Rotas `/client/*` são acessíveis por todos os usuários autenticados

## Simulação de API

O sistema utiliza dados simulados para demonstração:

### Mock de Autenticação
- Dados de usuários são armazenados em um array estático
- Tokens JWT são gerados localmente
- Os dados são persistidos apenas no localStorage

### Mock de Dados
- Pedidos, clientes e outros dados são gerados estaticamente
- Simulação de operações CRUD no client-side

## Limitações Atuais

- **Persistência de dados**: Apenas em memória e localStorage
- **Validações**: Implementadas apenas no client-side
- **Imagens**: Utilizando URLs de placeholders

## Próximos Passos

- Integração com backend real
- Upload de imagens de veículos
- Implementação de relatórios exportáveis
- Notificações em tempo real
- Sistema de busca avançada
