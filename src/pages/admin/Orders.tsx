// src/pages/admin/Orders.tsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import { OrdersService } from "@/services/ordersApi";
import { OrderStatus, OrderStatusesService } from "@/services/orderStatusesApi";

import { Order } from "@/types";

import OrdersHeader from "@/components/Orders/OrdersHeader";
import OrdersList from "@/components/Orders/OrdersList";
import OrdersKanban from "@/components/Orders/OrdersKanban";
import ConfirmDeleteModal from "@/components/Modals/ConfirmDeleteModal";

/* -------------------------------------------------------------------------- */

const OrdersPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  /* ---------- STATE ------------------------------------------------------- */
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [organizationMode, setOrganizationMode] = useState<"list" | "kanban">(
    "kanban"
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    orderId?: string;
  }>({ open: false });
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ---------- LOAD DATA --------------------------------------------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [fetchedOrders, fetchedStatuses] = await Promise.all([
          OrdersService.getOrders(user?.id, user?.role),
          OrderStatusesService.getOrderStatuses(),
        ]);

        setOrders(fetchedOrders);
        setStatuses(
          fetchedStatuses.sort((a, b) =>
            a.sort_order && b.sort_order
              ? a.sort_order - b.sort_order
              : a.name.localeCompare(b.name)
          )
        );
      } catch (err) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast, user?.id, user?.role]);

  /* ---------- MEMO LISTS -------------------------------------------------- */
  const uniqueClients = useMemo(() => {
    const ids = new Set(orders.map((o) => o.client?.id).filter(Boolean));
    return [...ids]
      .map((id) => {
        const c = orders.find((o) => o.client?.id === id)?.client;
        return c ? { id: c.id, name: c.name } : null;
      })
      .filter(Boolean) as { id: string; name: string }[];
  }, [orders]);

  const uniqueServices = useMemo(() => {
    const ids = new Set(orders.map((o) => o.serviceType?.id).filter(Boolean));
    return [...ids]
      .map((id) => {
        const s = orders.find((o) => o.serviceType?.id === id)?.serviceType;
        return s ? { id: s.id, name: s.name } : null;
      })
      .filter(Boolean) as { id: string; name: string }[];
  }, [orders]);

  /* ---------- FILTERED ORDERS -------------------------------------------- */
  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter((o) => {
      const okSearch =
        !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.client?.name?.toLowerCase().includes(q) ||
        o.serviceType?.name?.toLowerCase().includes(q) ||
        o.vehicle?.placa?.toLowerCase().includes(q);

      const okClient = clientFilter === "all" || o.client?.id === clientFilter;
      const okService =
        serviceFilter === "all" || o.serviceType?.id === serviceFilter;
      return okSearch && okClient && okService;
    });
  }, [orders, searchQuery, clientFilter, serviceFilter]);

  /* ---------- HELPERS ----------------------------------------------------- */
  const badge = (color: string) =>
    ((
      {
        "#3498db": "bg-blue-500 text-white",
        "#f39c12": "bg-yellow-500 text-white",
        "#9b59b6": "bg-purple-400 text-white",
        "#e74c3c": "bg-red-500 text-white",
        "#2ecc71": "bg-green-500 text-white",
      } as Record<string, string>
    )[color] ?? "bg-gray-500 text-white");

  /* ---------- DRAG / STATUS UPDATE ---------- */
  const handleMoveOrder = async (
    orderId: string,
    toStatusId: string,
    note = ""
  ) => {
    try {
      const updated = await OrdersService.updateOrder(orderId, {
        status_id: toStatusId,
        message: note || null, //  ←  trocado
      });

      // atualiza state local
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast({ title: "Status atualizado" });
    } catch (e) {
      toast({
        title: "Erro ao atualizar status",
        description: typeof e === "object" ? JSON.stringify(e) : String(e),
        variant: "destructive",
      });
    }
  };

  /* ---------- DELETE ------------------------------------------------------ */
  const handleRemoveOrder = async () => {
    if (!deleteModal.orderId) return;
    setDeleteLoading(true);
    try {
      await OrdersService.deleteOrder(deleteModal.orderId);
      setOrders((prev) => prev.filter((o) => o.id !== deleteModal.orderId));
      toast({ title: "Pedido removido com sucesso" });
    } catch (e) {
      toast({
        title: "Erro ao remover pedido",
        description: String(e),
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteModal({ open: false });
    }
  };

  /* ---------- RENDER ------------------------------------------------------ */
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <OrdersHeader
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          serviceFilter={serviceFilter}
          setServiceFilter={setServiceFilter}
          organizationMode={organizationMode}
          setOrganizationMode={setOrganizationMode}
          uniqueClients={uniqueClients}
          uniqueServices={uniqueServices}
          onOrderCreated={(o) => setOrders((prev) => [o, ...prev])}
        />

        {/* BODY */}
        {loading ? (
          <p className="text-center py-20 text-muted-foreground">Carregando…</p>
        ) : organizationMode === "kanban" ? (
          <OrdersKanban
            orders={filteredOrders}
            statuses={statuses}
            badge={badge}
            onMove={handleMoveOrder}
            onDelete={(id) => setDeleteModal({ open: true, orderId: id })}
          />
        ) : (
          <OrdersList
            orders={filteredOrders}
            statuses={statuses}
            setDeleteModal={setDeleteModal}
          />
        )}

        {/* MODAL DELETE */}
        <ConfirmDeleteModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false })}
          onConfirm={handleRemoveOrder}
          loading={deleteLoading}
          text="Deseja realmente remover este pedido?"
        />
      </div>
    </AppLayout>
  );
};

export default OrdersPage;
