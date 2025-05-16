
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import BrandSelector from './BrandSelector';
import ModelSelector from './ModelSelector';
import YearSelector from './YearSelector';

interface VehicleFormFieldsProps {
  form: any;
  simplified?: boolean;
  isLoading?: boolean;
}

const VehicleFormFields: React.FC<VehicleFormFieldsProps> = ({ 
  form, 
  simplified = false,
  isLoading = false 
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {!simplified && (
        <FormField
          control={form.control}
          name="licensePlate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa do Veículo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="AAA-0000 ou AAA0000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="space-y-4">
        <BrandSelector 
          form={form} 
          onBrandSelect={(brandCode) => setSelectedBrand(brandCode)} 
          isLoading={isLoading}
        />

        <ModelSelector 
          form={form} 
          brandCode={selectedBrand} 
          onModelSelect={(modelCode) => setSelectedModel(modelCode)} 
          isLoading={isLoading}
        />

        <YearSelector 
          form={form} 
          brandCode={selectedBrand} 
          modelCode={selectedModel} 
          isLoading={isLoading}
        />
      </div>

      {!simplified && (
        <>
          <FormField
            control={form.control}
            name="renavam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renavam</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Opcional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chassis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chassi</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Opcional" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default VehicleFormFields;
