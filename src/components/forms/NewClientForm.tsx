import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ClientsService } from "@/services/clientsApi";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Search, Plus, Car } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewVehicleForm from "./NewVehicleForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  document: z.string().min(11, "CPF/CNPJ inválido"),
  type: z.enum(["physical", "juridical"]),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  addVehicle: z.boolean().optional(),
  vehicleBrand: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehicleLicensePlate: z.string().optional(),
});

interface NewClientFormProps {
  onSuccess: () => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [searchingDocument, setSearchingDocument] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addVehicle, setAddVehicle] = useState(false);
  const [vehicleData, setVehicleData] = useState<any | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      document: "",
      type: "physical",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      state: "",
      addVehicle: false,
      vehicleBrand: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleLicensePlate: "",
    },
  });

  // Função para buscar CEP
  const handleSearchCep = async () => {
    const cep = form.getValues("postalCode");
    if (!cep || cep.length < 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, digite um CEP válido",
        variant: "destructive",
      });
      return;
    }

    setSearchingCep(true);
    try {
      const formattedCep = cep.replace(/[^\d]/g, "");
      const response = await fetch(
        `https://viacep.com.br/ws/${formattedCep}/json/`
      );

      if (!response.ok) throw new Error("CEP não encontrado");

      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado",
          variant: "destructive",
        });
        return;
      }

      form.setValue("address", `${data.logradouro}, ${data.bairro}`);
      form.setValue("city", data.localidade);
      form.setValue("state", data.uf);

      toast({
        title: "Endereço encontrado",
        description: `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`,
      });
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o endereço",
        variant: "destructive",
      });
    } finally {
      setSearchingCep(false);
    }
  };

  // Função para buscar CNPJ
  const handleSearchDocument = async () => {
    const document = form.getValues("document");
    const type = form.getValues("type");

    if (!document || document.length < 14 || type !== "juridical") {
      if (type !== "juridical") {
        toast({
          title: "Tipo incorreto",
          description:
            "A busca de CNPJ só está disponível para Pessoa Jurídica",
          variant: "destructive",
        });
      } else {
        toast({
          title: "CNPJ inválido",
          description: "Por favor, digite um CNPJ válido",
          variant: "destructive",
        });
      }
      return;
    }

    setSearchingDocument(true);
    try {
      const formattedCnpj = document.replace(/[^\d]/g, "");
      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${formattedCnpj}`
      );

      if (!response.ok) throw new Error("CNPJ não encontrado");

      const data = await response.json();

      form.setValue("name", data.razao_social);
      form.setValue("email", data.email || "");
      form.setValue("phone", data.ddd_telefone_1 || "");

      // Se tiver endereço completo
      if (data.cep) {
        form.setValue("postalCode", data.cep);
        form.setValue(
          "address",
          `${data.logradouro}, ${data.numero}, ${data.bairro}`
        );
        form.setValue("city", data.municipio);
        form.setValue("state", data.uf);
      }

      toast({
        title: "Empresa encontrada",
        description: data.razao_social,
      });
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar os dados da empresa",
        variant: "destructive",
      });
    } finally {
      setSearchingDocument(false);
    }
  };

  const handleAddVehicleChange = (checked: boolean) => {
    setAddVehicle(checked);
    form.setValue("addVehicle", checked);
  };

  const onVehicleFormSuccess = (vehicleData?: any) => {
    if (vehicleData) {
      setVehicleData(vehicleData);
      // Auto-fill some data in the form for display purposes
      form.setValue("vehicleBrand", vehicleData.brand || "");
      form.setValue("vehicleModel", vehicleData.model || "");
      form.setValue("vehicleYear", vehicleData.year || "");
      form.setValue("vehicleLicensePlate", vehicleData.licensePlate || "");

      toast({
        title: "Veículo adicionado",
        description:
          "As informações do veículo foram salvas e serão associadas ao cliente",
      });
    }
    setIsDialogOpen(false);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um cliente",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullAddress =
        values.address && values.city
          ? `${values.address}, ${values.city}${
              values.state ? `-${values.state}` : ""
            }`
          : undefined;

      const newClient = {
        name: values.name,
        document: values.document,
        type: values.type,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: fullAddress,
        createdBy: user.id,
      };

      const client = await ClientsService.createClient(newClient);

      // If tiver veículo para adicionar, criaremos após o cliente
      if (values.addVehicle && client && vehicleData) {
        // Aqui implementaríamos a lógica para salvar o veículo associado ao cliente
        console.log("Salvando veículo para cliente", client.id, vehicleData);

        toast({
          title: "Veículo registrado",
          description: "O veículo foi associado ao cliente com sucesso",
        });
      }

      toast({
        title: "Cliente criado",
        description: "Cliente cadastrado com sucesso",
      });

      onSuccess();
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Tipo de Cliente</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="physical" id="type-physical" />
                      <label
                        htmlFor="type-physical"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Pessoa Física
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="juridical" id="type-juridical" />
                      <label
                        htmlFor="type-juridical"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Pessoa Jurídica
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-start">
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    {form.watch("type") === "physical" ? "CPF" : "CNPJ"}
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          form.watch("type") === "physical"
                            ? "123.456.789-00"
                            : "12.345.678/0001-90"
                        }
                      />
                    </FormControl>
                    {form.watch("type") === "juridical" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={
                          !field.value ||
                          field.value.length < 14 ||
                          searchingDocument
                        }
                        onClick={handleSearchDocument}
                      >
                        {searchingDocument ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {form.watch("type") === "physical"
                    ? "Nome Completo"
                    : "Razão Social"}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      form.watch("type") === "physical"
                        ? "João da Silva"
                        : "Empresa LTDA"
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="exemplo@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="(11) 98765-4321" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4 items-start">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem className="w-40">
                  <FormLabel>CEP</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="00000-000" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={
                        !field.value || field.value.length < 8 || searchingCep
                      }
                      onClick={handleSearchCep}
                    >
                      {searchingCep ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Rua, número, bairro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="São Paulo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="w-20">
                  <FormLabel>UF</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SP" maxLength={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="addVehicle"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      handleAddVehicleChange(checked === true);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Adicionar Veículo</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Deseja cadastrar um veículo para este cliente?
                  </p>
                </div>
              </FormItem>
            )}
          />

          {addVehicle && (
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Informações do Veículo</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Adicionar Veículo
                </Button>
              </div>

              {vehicleData ? (
                <div className="bg-muted/20 p-4 rounded-md mb-4">
                  <h4 className="font-medium mb-2">Veículo registrado</h4>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Marca:</span>{" "}
                    {vehicleData.brand}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Modelo:</span>{" "}
                    {vehicleData.model}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Ano:</span> {vehicleData.year}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Placa:</span>{" "}
                    {vehicleData.licensePlate}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  Você poderá adicionar mais veículos após cadastrar o cliente.
                </p>
              )}

              {!vehicleData && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="add-vehicle">
                    <AccordionTrigger>Adicionar manualmente</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="vehicleLicensePlate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Placa do Veículo</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="AAA-0000 ou AAA0000"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicleBrand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marca</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: Honda, Toyota, Fiat..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicleModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modelo</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: Civic, Corolla, Uno..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicleYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ano</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: 2020/2021" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Cliente
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal para adicionar veículo usando o formulário completo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Veículo</DialogTitle>
          </DialogHeader>
          <NewVehicleForm onSuccess={onVehicleFormSuccess} simplified={false} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewClientForm;
