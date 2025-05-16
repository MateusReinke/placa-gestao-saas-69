
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

const SupabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  // Verifica se os usuários de demonstração já foram criados
  const checkDemoUsersExist = async () => {
    const { data: users, error } = await supabase
      .from('users')
      .select('email')
      .in('email', [
        'admin@emplacadora.com',
        'vendedor@emplacadora.com', 
        'cliente@emplacadora.com', 
        'empresa@emplacadora.com'
      ]);

    if (error) {
      console.error('Erro ao verificar usuários de demonstração:', error);
      return false;
    }

    // Se todos os 4 usuários de demonstração estiverem presentes, retorna true
    return users && users.length === 4;
  };

  // Inicializa usuários de demonstração chamando a edge function
  const initializeDemoUsers = async () => {
    try {
      // Chamar a edge function para inicializar os usuários
      const { data, error } = await supabase.functions.invoke('initialize-users', {
        method: 'POST'
      });
      
      if (error) {
        console.error('Erro ao inicializar usuários de demonstração:', error);
        toast.error('Erro ao inicializar usuários de demonstração');
        return false;
      }
      
      console.log('Resultado da inicialização de usuários:', data);
      
      if (data && data.message) {
        toast.success(data.message);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao inicializar usuários de demonstração:', error);
      toast.error('Erro ao inicializar usuários de demonstração');
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (initialized) return;

      try {
        const usersExist = await checkDemoUsersExist();
        
        if (!usersExist) {
          console.log('Inicializando usuários de demonstração...');
          await initializeDemoUsers();
        } else {
          console.log('Usuários de demonstração já existem.');
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Erro durante a inicialização:', error);
      }
    };

    initialize();
  }, [initialized]);

  return null; // Este componente não renderiza nada
};

export default SupabaseInitializer;
