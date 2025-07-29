-- Phase 2: Fix remaining security warnings and RLS issues

-- Fix RLS Disabled errors by enabling RLS on remaining tables
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plate_types ENABLE ROW LEVEL SECURITY;

-- Add proper RLS policies for service_categories
CREATE POLICY "Authenticated users can view service categories" 
ON public.service_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage service categories" 
ON public.service_categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Add proper RLS policies for plate_types  
CREATE POLICY "Authenticated users can view plate types" 
ON public.plate_types 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage plate types" 
ON public.plate_types 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Fix functions that don't have proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user_for_clients()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  client_name text;
begin
  -- Pega o email como nome padrão caso não tenha
  client_name := coalesce(new.raw_user_meta_data->>'name', new.email, 'Novo Cliente');
  insert into clients (name, type, email, user_id)
  values (client_name, 'physical', new.email, new.id);
  return new;
end;
$$;

-- Add validation trigger for orders to ensure data integrity
CREATE OR REPLACE FUNCTION public.validate_order_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that service_type exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM service_types 
    WHERE id = NEW.service_type_id AND active = true
  ) THEN
    RAISE EXCEPTION 'Tipo de serviço inválido ou inativo.';
  END IF;

  -- Validate that status exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM order_statuses 
    WHERE id = NEW.status_id AND active = true
  ) THEN
    RAISE EXCEPTION 'Status do pedido inválido ou inativo.';
  END IF;

  -- Validate that client exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM clients 
    WHERE id = NEW.client_id AND active = true
  ) THEN
    RAISE EXCEPTION 'Cliente inválido ou inativo.';
  END IF;

  -- Validate value is not negative
  IF NEW.value < 0 THEN
    RAISE EXCEPTION 'Valor do pedido não pode ser negativo.';
  END IF;

  RETURN NEW;
END;
$$;

-- Add trigger to validate order data
DROP TRIGGER IF EXISTS validate_order_data_trigger ON public.orders;
CREATE TRIGGER validate_order_data_trigger
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_data();

-- Add constraint to ensure order numbers are unique when not null
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS unique_order_number;
ALTER TABLE public.orders 
ADD CONSTRAINT unique_order_number 
UNIQUE (order_number);

-- Add CPF/CNPJ validation function
CREATE OR REPLACE FUNCTION public.validate_document(doc text, doc_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove formatting
  doc := regexp_replace(doc, '[^0-9]', '', 'g');
  
  -- Validate CPF (11 digits)
  IF doc_type = 'physical' THEN
    RETURN length(doc) = 11 AND doc ~ '^[0-9]{11}$';
  -- Validate CNPJ (14 digits)  
  ELSIF doc_type = 'juridical' THEN
    RETURN length(doc) = 14 AND doc ~ '^[0-9]{14}$';
  END IF;
  
  RETURN false;
END;
$$;

-- Add document validation trigger for clients
CREATE OR REPLACE FUNCTION public.validate_client_document()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT validate_document(NEW.document, NEW.type) THEN
    RAISE EXCEPTION 'Documento inválido para o tipo de cliente especificado.';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_client_document_trigger ON public.clients;
CREATE TRIGGER validate_client_document_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_client_document();

-- Add unique constraint for client documents
ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS unique_client_document;
ALTER TABLE public.clients 
ADD CONSTRAINT unique_client_document 
UNIQUE (document);

-- Create additional audit triggers for remaining tables
CREATE TRIGGER audit_vehicles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_service_types_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.service_types
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_inventory_items_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();