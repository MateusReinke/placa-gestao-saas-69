
# Implementação de Banco de Dados - Projeto VehiclePlate

Este documento detalha o plano de implementação de banco de dados para tornar o projeto VehiclePlate 100% funcional.

## Escolha da Tecnologia: Supabase

Recomendamos o Supabase como solução de banco de dados e backend para este projeto, devido à:
- Facilidade de integração com React
- Autenticação pronta para uso
- APIs RESTful automáticas
- Políticas de segurança granulares (RLS)
- Armazenamento de arquivos
- Funções serverless
- API para tempo real

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'physical', 'juridical')),
  document TEXT,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 2. clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('physical', 'juridical')),
  address TEXT,
  phone TEXT,
  email TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 3. service_types
```sql
CREATE TABLE service_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_service_types_updated_at
BEFORE UPDATE ON service_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 4. order_statuses
```sql
CREATE TABLE order_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  order INTEGER NOT NULL,
  color TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. vehicles
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_plate TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT NOT NULL,
  color TEXT,
  client_id UUID REFERENCES clients(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 6. orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  service_type_id UUID REFERENCES service_types(id) NOT NULL,
  status_id UUID REFERENCES order_statuses(id) NOT NULL,
  license_plate TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  notes TEXT,
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 7. inventory_items
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at
CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### 8. inventory_movements
```sql
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID REFERENCES inventory_items(id) NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out')),
  quantity INTEGER NOT NULL,
  responsible_id UUID REFERENCES users(id) NOT NULL,
  order_id UUID REFERENCES orders(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Funções de Utilidade

```sql
-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular o status do estoque
CREATE OR REPLACE FUNCTION calculate_inventory_status(quantity INTEGER, min_quantity INTEGER)
RETURNS TEXT AS $$
BEGIN
   IF quantity = 0 THEN
      RETURN 'critical';
   ELSIF quantity <= min_quantity THEN
      RETURN 'low';
   ELSE
      RETURN 'adequate';
   END IF;
END;
$$ LANGUAGE plpgsql;
```

### Views

#### 1. View de Pedidos Completa

```sql
CREATE VIEW complete_orders AS
SELECT 
  o.id,
  o.license_plate,
  o.value,
  o.notes,
  o.estimated_delivery_date,
  o.created_at,
  o.updated_at,
  c.id as client_id,
  c.name as client_name,
  c.document as client_document,
  c.type as client_type,
  u.id as seller_id,
  u.name as seller_name,
  st.id as service_type_id,
  st.name as service_type_name,
  os.id as status_id,
  os.name as status_name,
  os.color as status_color,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.year as vehicle_year,
  v.color as vehicle_color
FROM 
  orders o
JOIN 
  clients c ON o.client_id = c.id
JOIN 
  users u ON o.created_by = u.id
JOIN 
  service_types st ON o.service_type_id = st.id
JOIN 
  order_statuses os ON o.status_id = os.id
LEFT JOIN 
  vehicles v ON o.license_plate = v.license_plate;
```

#### 2. View de Status de Estoque

```sql
CREATE VIEW inventory_status AS
SELECT 
  i.*,
  calculate_inventory_status(i.quantity, i.min_quantity) as status
FROM 
  inventory_items i;
```

## Políticas de Segurança (RLS)

### 1. Políticas para Users

```sql
-- Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY admin_all_users ON users 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para vendedores (podem ver administradores e outros vendedores)
CREATE POLICY seller_read_users ON users 
FOR SELECT TO authenticated 
USING (
  (auth.jwt() ->> 'role' = 'seller' AND (role IN ('admin', 'seller')))
  OR
  (auth.uid() = id) -- sempre pode ver o próprio registro
);

-- Políticas para clientes (podem ver apenas seu próprio registro)
CREATE POLICY client_read_own_profile ON users 
FOR SELECT TO authenticated 
USING (auth.uid() = id);
```

### 2. Políticas para Clients

```sql
-- Habilitar RLS na tabela clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY admin_all_clients ON clients 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas para vendedores (podem ver/editar apenas clientes que criaram)
CREATE POLICY seller_crud_own_clients ON clients 
FOR ALL TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'seller' 
  AND 
  created_by = auth.uid()
);

-- Políticas para clientes (físicos/jurídicos podem ver apenas seu próprio registro)
CREATE POLICY client_view_own_profile ON clients 
FOR SELECT TO authenticated 
USING (
  (auth.jwt() ->> 'role' IN ('physical', 'juridical')) 
  AND 
  document = (SELECT document FROM users WHERE id = auth.uid())
);
```

### 3. Políticas para Service Types

```sql
-- Habilitar RLS na tabela service_types
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar serviços ativos
CREATE POLICY view_active_services ON service_types 
FOR SELECT TO authenticated 
USING (active = true);

-- Apenas administradores podem gerenciar serviços
CREATE POLICY admin_manage_services ON service_types 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');
```

### 4. Políticas para Order Statuses

```sql
-- Habilitar RLS na tabela order_statuses
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;

-- Todos podem visualizar status
CREATE POLICY view_all_statuses ON order_statuses 
FOR SELECT TO authenticated 
USING (true);

-- Apenas administradores podem gerenciar status
CREATE POLICY admin_manage_statuses ON order_statuses 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');
```

### 5. Políticas para Vehicles

```sql
-- Habilitar RLS na tabela vehicles
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Administradores têm acesso completo
CREATE POLICY admin_all_vehicles ON vehicles 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

-- Vendedores podem ver/editar veículos de seus clientes
CREATE POLICY seller_crud_client_vehicles ON vehicles 
FOR ALL TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'seller' 
  AND 
  client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
);

-- Clientes podem ver apenas seus próprios veículos
CREATE POLICY client_view_own_vehicles ON vehicles 
FOR SELECT TO authenticated 
USING (
  auth.jwt() ->> 'role' IN ('physical', 'juridical') 
  AND 
  client_id IN (
    SELECT id FROM clients 
    WHERE document = (SELECT document FROM users WHERE id = auth.uid())
  )
);
```

### 6. Políticas para Orders

```sql
-- Habilitar RLS na tabela orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Administradores têm acesso completo
CREATE POLICY admin_all_orders ON orders 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

-- Vendedores podem ver/gerenciar pedidos que criaram
CREATE POLICY seller_crud_own_orders ON orders 
FOR ALL TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'seller' 
  AND 
  (
    created_by = auth.uid() 
    OR 
    client_id IN (SELECT id FROM clients WHERE created_by = auth.uid())
  )
);

-- Clientes podem ver apenas seus próprios pedidos
CREATE POLICY client_view_own_orders ON orders 
FOR SELECT TO authenticated 
USING (
  auth.jwt() ->> 'role' IN ('physical', 'juridical') 
  AND 
  client_id IN (
    SELECT id FROM clients 
    WHERE document = (SELECT document FROM users WHERE id = auth.uid())
  )
);
```

### 7. Políticas para Inventory

```sql
-- Habilitar RLS nas tabelas de inventário
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Administradores têm acesso completo ao inventário
CREATE POLICY admin_all_inventory ON inventory_items 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY admin_all_movements ON inventory_movements 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

-- Vendedores podem apenas visualizar o inventário
CREATE POLICY seller_view_inventory ON inventory_items 
FOR SELECT TO authenticated 
USING (auth.jwt() ->> 'role' = 'seller');

CREATE POLICY seller_view_movements ON inventory_movements 
FOR SELECT TO authenticated 
USING (auth.jwt() ->> 'role' = 'seller');
```

## Índices para Otimização

```sql
-- Índices para melhorar a performance de consultas frequentes
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_clients_document ON clients(document);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_client_id ON vehicles(client_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_status_id ON orders(status_id);
CREATE INDEX idx_orders_service_type_id ON orders(service_type_id);
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
```

## Dados Iniciais (Seeds)

Recomendamos a criação de scripts para inserção de dados iniciais:

1. Status de pedidos padrão (Novo, Pendente, Em Processamento, Concluído, Cancelado)
2. Tipos de serviços básicos
3. Usuário administrador inicial
4. Categorias de itens de inventário

## Integração com o Frontend

### 1. Configuração do Cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 2. Autenticação

Substituir o sistema de autenticação mock pelo Supabase Auth, aproveitando:
- Login/Signup com email/senha
- Recuperação de senha
- Magic links
- OAuth providers (Google, Facebook, etc.)

### 3. Adaptação dos Serviços

Refatorar o arquivo `ApiService.ts` para usar o Supabase ao invés de dados mock.

### 4. Typings

Gerar tipos TypeScript para o banco de dados usando a ferramenta CLI do Supabase:

```bash
supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
```

## Funções Serverless (Edge Functions)

Implementar funções serverless para:

1. Notificações por email ao alterar status do pedido
2. Webhooks para integração com sistemas externos
3. Relatórios periódicos
4. Cálculos complexos que não podem ser feitos no cliente

## Considerações sobre Migração

1. Implementar a migração gradualmente, começando pelos dados mestres (clientes, serviços)
2. Desenvolver e testar cada módulo separadamente
3. Manter compatibilidade com a interface existente
4. Implementar failsafes para evitar perda de dados

## Próximos Passos após Implementação do Banco

1. Implementar sistema de cache com React Query
2. Adicionar funcionalidades de exportação de dados (CSV, PDF)
3. Desenvolver dashboard de administração avançado
4. Implementar notificações em tempo real usando os canais do Supabase
5. Desenvolver aplicativo móvel usando o mesmo backend
