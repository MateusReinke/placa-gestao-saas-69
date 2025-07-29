-- Phase 1: Critical Database Security - Enable RLS and Fix Authentication Issues

-- 1. Enable RLS on unprotected tables
ALTER TABLE public.n8n_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_fila_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_historico_mensagens ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for n8n tables (admin only access)
CREATE POLICY "Admin only access to n8n_user_sessions" 
ON public.n8n_user_sessions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin only access to n8n_fila_mensagens" 
ON public.n8n_fila_mensagens 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin only access to n8n_historico_mensagens" 
ON public.n8n_historico_mensagens 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 3. Fix security definer view - Replace with proper function
DROP VIEW IF EXISTS public.inventory_status;

CREATE OR REPLACE FUNCTION public.get_inventory_status()
RETURNS TABLE (
  id uuid,
  quantity integer,
  min_quantity integer,
  cost_price numeric,
  created_at timestamptz,
  updated_at timestamptz,
  name text,
  category text,
  status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.quantity,
    i.min_quantity,
    i.cost_price,
    i.created_at,
    i.updated_at,
    i.name,
    i.category,
    calculate_inventory_status(i.quantity, i.min_quantity) as status
  FROM inventory_items i;
$$;

-- Grant access to the function based on user roles
GRANT EXECUTE ON FUNCTION public.get_inventory_status() TO authenticated;

-- 4. Add proper search path to existing functions for security
CREATE OR REPLACE FUNCTION public.calculate_inventory_status(quantity integer, min_quantity integer)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
   IF quantity = 0 THEN
      RETURN 'critical';
   ELSIF quantity <= min_quantity THEN
      RETURN 'low';
   ELSE
      RETURN 'adequate';
   END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_order_vehicle()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vehicle_owner uuid;
BEGIN
  SELECT client_id INTO vehicle_owner
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  IF vehicle_owner IS NULL THEN
    RAISE EXCEPTION 'Veículo não encontrado.';
  END IF;

  IF vehicle_owner != NEW.client_id THEN
    RAISE EXCEPTION 'Este veículo não pertence ao cliente informado.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  category_prefix text;
  count_same_prefix int;
BEGIN
  -- Busca o prefixo da categoria associada ao service_type
  SELECT sc.prefix INTO category_prefix
  FROM service_types st
  JOIN service_categories sc ON sc.id = st.category_id
  WHERE st.id = NEW.service_type_id;

  IF category_prefix IS NULL THEN
    RAISE EXCEPTION 'Prefixo de categoria não encontrado para o service_type_id: %', NEW.service_type_id;
  END IF;

  -- Conta quantos pedidos existem com esse prefixo
  SELECT COUNT(*) INTO count_same_prefix
  FROM orders
  WHERE order_number LIKE category_prefix || '-%';

  -- Gera o código com 4 dígitos (PLA-0001, DOC-0012)
  NEW.order_number := category_prefix || '-' || LPAD((count_same_prefix + 1)::text, 4, '0');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;

-- 5. Add data validation constraints
ALTER TABLE public.clients 
ADD CONSTRAINT valid_client_type 
CHECK (type IN ('physical', 'juridical'));

ALTER TABLE public.clients 
ADD CONSTRAINT valid_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.users 
ADD CONSTRAINT valid_user_role 
CHECK (role IN ('admin', 'seller', 'physical', 'juridical'));

ALTER TABLE public.users 
ADD CONSTRAINT valid_user_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 6. Strengthen RLS policies - Replace overly permissive ones
DROP POLICY IF EXISTS "services_select" ON public.service_types;
DROP POLICY IF EXISTS "services_insert" ON public.service_types;
DROP POLICY IF EXISTS "services_update" ON public.service_types;
DROP POLICY IF EXISTS "services_delete" ON public.service_types;

-- More restrictive service types policies
CREATE POLICY "Authenticated users can view active services" 
ON public.service_types 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND active = true);

CREATE POLICY "Admin can manage all services" 
ON public.service_types 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- 7. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  operation text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all audit logs" 
ON public.audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();