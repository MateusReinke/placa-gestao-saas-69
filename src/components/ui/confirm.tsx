
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmProps {
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
}

// Create a function that returns a promise
export const confirm = ({ 
  title, 
  description, 
  cancelText = "Cancelar", 
  confirmText = "Confirmar" 
}: ConfirmProps): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create custom elements for the dialog
    const dialog = document.createElement("div");
    dialog.setAttribute("data-confirm-dialog", "true");
    document.body.appendChild(dialog);

    // Function to clean up the dialog
    const cleanup = () => {
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    };

    // Render React component with dialog
    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    // Use React.render or ReactDOM.render to render the component
    const DialogComponent = () => (
      <AlertDialog defaultOpen onOpenChange={(open) => { if (!open) handleCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>{confirmText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    // Use ReactDOM.render to render the dialog
    const ReactDOM = require('react-dom');
    ReactDOM.render(<DialogComponent />, dialog);
  });
};
