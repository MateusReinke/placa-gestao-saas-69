
// Supabase Edge Function para inicializar usuários de demonstração
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Cria cliente Supabase usando variáveis de ambiente do projeto
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Endpoint da edge function
Deno.serve(async (req) => {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Verifica se os usuários de demonstração já existem
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email')
      .in('email', [
        'admin@emplacadora.com',
        'vendedor@emplacadora.com', 
        'cliente@emplacadora.com', 
        'empresa@emplacadora.com'
      ])

    if (checkError) {
      throw new Error(`Erro ao verificar usuários: ${checkError.message}`)
    }

    // Se todos os 4 usuários já existem, retorna
    if (existingUsers && existingUsers.length === 4) {
      return new Response(
        JSON.stringify({
          message: 'Todos os usuários de demonstração já existem',
          usersFound: existingUsers.length,
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Lista de usuários demo para criar
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
    ]

    // Mapa para acompanhar quais emails já existem
    const existingEmails = new Set(existingUsers?.map(u => u.email) || [])
    const results = []

    // Cria cada usuário demo que não existe
    for (const user of demoUsers) {
      // Pula se o usuário já existe
      if (existingEmails.has(user.email)) {
        results.push({
          email: user.email,
          status: 'skipped',
          message: 'Usuário já existe'
        })
        continue
      }

      try {
        // Verifica se o usuário existe na autenticação
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserByEmail(user.email)
        
        let userId
        
        // Se o usuário não existe na autenticação, cria
        if (!authUser) {
          const { data: newUser, error: signupError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true
          })

          if (signupError || !newUser) {
            throw new Error(`Erro ao criar usuário de autenticação: ${signupError?.message}`)
          }
          
          userId = newUser.user.id
        } else {
          userId = authUser.user.id
        }
        
        // Insere o registro na tabela users
        const { error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            email: user.email,
            ...user.userData
          })
          
        if (insertError) {
          throw new Error(`Erro ao inserir na tabela users: ${insertError.message}`)
        }
        
        results.push({
          email: user.email,
          status: 'created',
          message: 'Usuário criado com sucesso'
        })
      } catch (error) {
        results.push({
          email: user.email,
          status: 'error',
          message: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Inicialização de usuários concluída',
        results
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Erro durante a inicialização: ${error.message}`
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
