
import React from 'react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const SellerSettings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Configurações da Conta</h1>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" placeholder="Nome Completo" defaultValue="Carlos Santos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Profissional</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" defaultValue="carlos@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" defaultValue="(11) 98765-4321" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">CPF</Label>
                    <Input id="document" placeholder="000.000.000-00" defaultValue="123.456.789-00" />
                  </div>
                </div>
                <Button className="mt-4">Salvar Alterações</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>
                  Personalize sua experiência de uso do sistema.
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
                    <p className="font-medium">Visualização em Kanban como Padrão</p>
                    <p className="text-sm text-muted-foreground">
                      Usar visualização em Kanban como padrão para pedidos.
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
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Escolha como e quando receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Novos Pedidos</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando novos pedidos forem atribuídos a você.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Atualizações de Pedidos</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando seus pedidos forem atualizados.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Novos Clientes</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando novos clientes forem atribuídos a você.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alertas de Estoque</p>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas quando itens estiverem com estoque baixo.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Gerencie a segurança e o acesso à sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Alterar Senha</h3>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input id="current-password" type="password" />
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input id="new-password" type="password" />
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input id="confirm-password" type="password" />
                      <Button className="mt-2">Atualizar Senha</Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Autenticação em duas etapas</p>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança à sua conta.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <h3 className="font-medium">Sessões Ativas</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Navegador Chrome - Windows</p>
                            <p className="text-xs text-muted-foreground">São Paulo, Brasil - Ativo agora</p>
                          </div>
                          <Button variant="outline" size="sm">Este dispositivo</Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Aplicativo iOS - iPhone</p>
                            <p className="text-xs text-muted-foreground">São Paulo, Brasil - Última atividade: 2 dias atrás</p>
                          </div>
                          <Button variant="outline" size="sm">Encerrar</Button>
                        </div>
                      </div>
                    </div>
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

export default SellerSettings;
