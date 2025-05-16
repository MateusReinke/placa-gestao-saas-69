
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Cria um usuário de demonstração
  const createDemoUser = async (email: string, password: string, userData: any) => {
    try {
      // Verificar se o usuário já existe no sistema de autenticação
      const { data: { users } } = await supabase.auth.admin.listUsers({
        filter: `email.eq.${email}`
      });
      
      let userId;
      
      // Se o usuário não existe no sistema de autenticação ou não foi encontrado
      if (!users || users.length === 0) {
        // Cria o usuário no sistema de autenticação
        const { data: newUser, error: signupError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });

        if (signupError || !newUser) {
          console.error(`Erro ao criar usuário de autenticação ${email}:`, signupError);
          return;
        }
        
        userId = newUser.user.id;
      } else {
        userId = users[0].id;
      }
      
      // Verifica se já existe um registro para este usuário na tabela users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (existingUser) {
        console.log(`Usuário ${email} já existe na tabela users`);
        return;
      }
      
      // Insere o registro na tabela users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          ...userData
        });
        
      if (insertError) {
        console.error(`Erro ao criar usuário ${email} na tabela users:`, insertError);
        return;
      }
      
      console.log(`Usuário de demonstração ${email} criado com sucesso`);
    } catch (error) {
      console.error(`Erro ao criar usuário ${email}:`, error);
    }
  };

  // Cria os usuários de demonstração
  const createDemoUsers = async () => {
    const demoUsers = [
      {
        email: 'admin@emplacadora.com',
        password: '123456',
        userData: {
          name: 'Administrador',
          role: 'admin',
          document: '12345678900',
          phone: '11999999999'
        }
      },
      {
        email: 'vendedor@emplacadora.com',
        password: '123456',
        userData: {
          name: 'Vendedor',
          role: 'seller',
          document: '98765432100',
          phone: '11988888888'
        }
      },
      {
        email: 'cliente@emplacadora.com',
        password: '123456',
        userData: {
          name: 'Cliente Físico',
          role: 'physical',
          document: '11122233344',
          phone: '11977777777'
        }
      },
      {
        email: 'empresa@emplacadora.com',
        password: '123456',
        userData: {
          name: 'Cliente Jurídico',
          role: 'juridical',
          document: '11222333000144',
          phone: '11966666666'
        }
      }
    ];

    for (const user of demoUsers) {
      await createDemoUser(user.email, user.password, user.userData);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (initialized) return;

      try {
        const usersExist = await checkDemoUsersExist();
        
        if (!usersExist) {
          console.log('Criando usuários de demonstração...');
          await createDemoUsers();
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
