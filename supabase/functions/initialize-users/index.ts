
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

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
          message: 'Inicialização de usuários concluída',
          usersFound: existingUsers.length,
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const existingAuthUser = users?.find(u => u.email === user.email)
        
        let userId
        
        // Se o usuário não existe na autenticação, cria
        if (!existingAuthUser) {
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
          userId = existingAuthUser.id
        }
        
        // Verifica se já existe um registro para este usuário na tabela users
        const { data: existingUserRecord } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle()
          
        if (existingUserRecord) {
          results.push({
            email: user.email,
            status: 'skipped',
            message: 'Usuário já existe na tabela users'
          })
          continue
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

    // Agora vamos criar dados de teste para as tabelas mencionadas
    // Clientes
    const clientsToAdd = [
      {
        name: 'Empresa de Logística ABC',
        document: '12345678000199',
        type: 'juridical',
        email: 'contato@logisticaabc.com',
        phone: '1130303030',
        address: 'Av. Paulista, 1000, São Paulo, SP',
        created_by: userId => userId // será substituído pelo ID do vendedor
      },
      {
        name: 'João da Silva',
        document: '11122233344',
        type: 'physical',
        email: 'joao.silva@email.com',
        phone: '1199998888',
        address: 'Rua das Flores, 123, São Paulo, SP',
        created_by: userId => userId // será substituído pelo ID do vendedor
      },
      {
        name: 'Transportes Rápidos Ltda',
        document: '98765432000199',
        type: 'juridical',
        email: 'contato@transportesrapidos.com',
        phone: '1132323232',
        address: 'Rod. Anhanguera, Km 30, Osasco, SP',
        created_by: userId => userId // será substituído pelo ID do vendedor
      }
    ]

    // Primeiro, vamos obter o ID do vendedor
    const { data: seller } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'vendedor@emplacadora.com')
      .single()
      
    if (seller) {
      const sellerId = seller.id
      
      // Inserir clientes
      for (const client of clientsToAdd) {
        // Verificar se o cliente já existe
        const { data: existingClient } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('document', client.document)
          .maybeSingle()
          
        if (!existingClient) {
          await supabaseAdmin
            .from('clients')
            .insert({
              ...client,
              created_by: sellerId
            })
        }
      }
      
      // Obter clientes inseridos
      const { data: clientsData } = await supabaseAdmin
        .from('clients')
        .select('id, name, type')
        
      if (clientsData && clientsData.length > 0) {
        // Adicionar veículos
        const vehiclesToAdd = [
          {
            license_plate: 'ABC1234',
            brand: 'Toyota',
            model: 'Corolla',
            year: '2022',
            color: 'Prata',
            client_id: clientsData[0].id
          },
          {
            license_plate: 'DEF5678',
            brand: 'Honda',
            model: 'Civic',
            year: '2021',
            color: 'Preto',
            client_id: clientsData[1].id
          },
          {
            license_plate: 'GHI9012',
            brand: 'Volkswagen',
            model: 'Gol',
            year: '2020',
            color: 'Branco',
            client_id: clientsData[0].id
          }
        ]
        
        for (const vehicle of vehiclesToAdd) {
          // Verificar se o veículo já existe
          const { data: existingVehicle } = await supabaseAdmin
            .from('vehicles')
            .select('id')
            .eq('license_plate', vehicle.license_plate)
            .maybeSingle()
            
          if (!existingVehicle) {
            await supabaseAdmin
              .from('vehicles')
              .insert(vehicle)
          }
        }
        
        // Obter tipos de serviço
        const { data: serviceTypes } = await supabaseAdmin
          .from('service_types')
          .select('id')
          
        if (!serviceTypes || serviceTypes.length === 0) {
          // Criar tipos de serviço
          await supabaseAdmin
            .from('service_types')
            .insert([
              {
                name: 'Emplacamento',
                description: 'Serviço de emplacamento de veículos novos',
                active: true
              },
              {
                name: 'Transferência',
                description: 'Serviço de transferência de propriedade',
                active: true
              },
              {
                name: 'Segunda Via',
                description: 'Emissão de segunda via da placa',
                active: true
              }
            ])
        }
        
        // Obter status de pedidos
        const { data: orderStatuses } = await supabaseAdmin
          .from('order_statuses')
          .select('id')
          
        if (!orderStatuses || orderStatuses.length === 0) {
          // Criar status de pedidos
          await supabaseAdmin
            .from('order_statuses')
            .insert([
              {
                name: 'Novo',
                color: '#3498db',
                sort_order: 1,
                active: true
              },
              {
                name: 'Em Análise',
                color: '#f39c12',
                sort_order: 2,
                active: true
              },
              {
                name: 'Aguardando Documentação',
                color: '#e74c3c',
                sort_order: 3,
                active: true
              },
              {
                name: 'Processando',
                color: '#2ecc71',
                sort_order: 4,
                active: true
              },
              {
                name: 'Concluído',
                color: '#27ae60',
                sort_order: 5,
                active: true
              },
              {
                name: 'Cancelado',
                color: '#7f8c8d',
                sort_order: 6,
                active: true
              }
            ])
        }
        
        // Buscar tipos de serviço e status para criar pedidos
        const { data: updatedServiceTypes } = await supabaseAdmin
          .from('service_types')
          .select('id')
          
        const { data: updatedOrderStatuses } = await supabaseAdmin
          .from('order_statuses')
          .select('id')
          
        if (updatedServiceTypes && updatedServiceTypes.length > 0 && 
            updatedOrderStatuses && updatedOrderStatuses.length > 0) {
          // Criar pedidos
          const ordersToAdd = [
            {
              client_id: clientsData[0].id,
              status_id: updatedOrderStatuses[0].id,
              service_type_id: updatedServiceTypes[0].id,
              created_by: sellerId,
              license_plate: 'ABC1234',
              value: 250.00,
              notes: 'Emplacamento de veículo novo'
            },
            {
              client_id: clientsData[1].id,
              status_id: updatedOrderStatuses[1].id,
              service_type_id: updatedServiceTypes[1].id,
              created_by: sellerId,
              license_plate: 'DEF5678',
              value: 180.00,
              notes: 'Transferência de propriedade'
            },
            {
              client_id: clientsData[0].id,
              status_id: updatedOrderStatuses[4].id,
              service_type_id: updatedServiceTypes[0].id,
              created_by: sellerId,
              license_plate: 'GHI9012',
              value: 250.00,
              notes: 'Emplacamento já concluído'
            }
          ]
          
          for (const order of ordersToAdd) {
            // Verificar se ordem já existe
            const { data: existingOrders } = await supabaseAdmin
              .from('orders')
              .select('id')
              .eq('client_id', order.client_id)
              .eq('license_plate', order.license_plate)
              
            if (!existingOrders || existingOrders.length === 0) {
              await supabaseAdmin
                .from('orders')
                .insert(order)
            }
          }
        }
        
        // Criar itens de estoque
        const inventoryItemsToAdd = [
          {
            name: 'Placa Padrão Mercosul',
            category: 'Placas',
            quantity: 50,
            min_quantity: 10,
            cost_price: 120.00
          },
          {
            name: 'Placa Especial',
            category: 'Placas',
            quantity: 20,
            min_quantity: 5,
            cost_price: 180.00
          },
          {
            name: 'Lacre de Segurança',
            category: 'Acessórios',
            quantity: 100,
            min_quantity: 30,
            cost_price: 15.00
          },
          {
            name: 'Suporte de Placa',
            category: 'Acessórios',
            quantity: 30,
            min_quantity: 10,
            cost_price: 25.00
          }
        ]
        
        for (const item of inventoryItemsToAdd) {
          // Verificar se item já existe
          const { data: existingItem } = await supabaseAdmin
            .from('inventory_items')
            .select('id')
            .eq('name', item.name)
            .eq('category', item.category)
            .maybeSingle()
            
          if (!existingItem) {
            await supabaseAdmin
              .from('inventory_items')
              .insert(item)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Inicialização de usuários concluída',
        results
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Erro durante a inicialização: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
