import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/app/ProtectedRoute";

import { Login } from "@/pages/auth/Login";
import { Dashboard } from "@/pages/dashboard/Dashboard";

import { Products } from "@/pages/products/Products";
import { ProductCreate } from "@/pages/products/ProductCreate";
import { ProductEdit } from "@/pages/products/ProductEdit";

import { Orders } from "@/pages/orders/Orders";
import { OrderDetails } from "@/pages/orders/OrderDetails";
import { OrderCreate } from "@/pages/orders/OrderCreate";

import { Customers } from "@/pages/customers/Customers";
import { CustomerCreate } from "@/pages/customers/CustomerCreate";

import { CustomerEdit } from "@/pages/customers/CustomerEdit";

import Reports from "@/pages/reports/Reports";

import { Finance } from "@/pages/finance/Finance";

import Settings from "@/pages/settings/Settings";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REDIRECIONAMENTO INICIAL */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Visão geral">
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* PRODUTOS */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Produtos">
                <Products />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* NOVO PRODUTO */}
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Novo produto">
                <ProductCreate />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* EDITAR PRODUTO */}
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Editar produto">
                <ProductEdit />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* PEDIDOS */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Pedidos">
                <Orders />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* NOVO PEDIDO */}
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Novo pedido">
                <OrderCreate />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* DETALHES DO PEDIDO */}
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Detalhes do pedido">
                <OrderDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Clientes">
                <Customers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* NOVO CLIENTE */}
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Novo cliente">
                <CustomerCreate />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* EDITAR CLIENTE */}
        <Route
          path="/customers/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Editar cliente">
                <CustomerEdit />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* FINANCEIRO */}
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Financeiro">
                <Finance />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* RELATÓRIOS */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Relatórios">
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* CONFIGURAÇÕES */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout currentPage="Configurações">
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ROTA NÃO ENCONTRADA */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}