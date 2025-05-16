
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const AdminSettings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="backups">Backup e Exportação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>
                  Defina as informações básicas da sua empresa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input id="company-name" placeholder="Nome da Empresa" defaultValue="Despachante Rápido LTDA" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" defaultValue="12.345.678/0001-90" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" defaultValue="(11) 3456-7890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="contato@empresa.com" defaultValue="contato@despachantefast.com" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" placeholder="Endereço completo" defaultValue="Av. Paulista, 1000, São Paulo - SP" />
                  </div>
                </div>
                <Button className="mt-4">Salvar Alterações</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Personalize o comportamento do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Modo Escuro</p>
                    <p className="text-sm text-muted-foreground">
                      Ativar tema escuro na interface.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de Estoque Baixo</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações quando itens atingirem estoque mínimo.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Confirmação de Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar emails de confirmação para clientes após pedidos.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Usuários</CardTitle>
                <CardDescription>
                  Gerencie as permissões e acesso de usuários.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-registro de Clientes</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que clientes se registrem sem aprovação.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vendedores podem criar serviços</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que vendedores criem novos serviços.
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação em duas etapas</p>
                    <p className="text-sm text-muted-foreground">
                      Exigir autenticação em duas etapas para administradores.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Personalize como e quando receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Novos Pedidos</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando novos pedidos forem criados.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pedidos Atualizados</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando pedidos forem atualizados.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Novos Clientes</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando novos clientes se registrarem.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações por Email</p>
                      <p className="text-sm text-muted-foreground">
                        Enviar todas as notificações também por email.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Exportação</CardTitle>
                <CardDescription>
                  Gerencie backups do sistema e exportação de dados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Backup Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie um backup completo dos dados do sistema.
                  </p>
                  <Button>Criar Backup</Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Backup Automático</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure backups automáticos periódicos.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-backup" />
                    <Label htmlFor="auto-backup">Ativar backup automático</Label>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <h3 className="font-medium mb-2">Exportar Dados</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">Exportar Clientes (CSV)</Button>
                    <Button variant="outline" className="w-full justify-start">Exportar Pedidos (CSV)</Button>
                    <Button variant="outline" className="w-full justify-start">Exportar Relatório Financeiro (PDF)</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminSettings;
