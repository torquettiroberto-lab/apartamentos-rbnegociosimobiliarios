import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Home from "@/pages/Home";
import Listagem from "@/pages/Listagem";
import Detalhe from "@/pages/Detalhe";
import Contato from "@/pages/Contato";
import NotFound from "@/pages/NotFound";

// O painel é carregado só quando alguém o acessa, para não pesar a vitrine pública.
const Login = lazy(() => import("@/pages/admin/Login"));
const AdminLista = lazy(() => import("@/pages/admin/Lista"));
const AdminFormulario = lazy(() => import("@/pages/admin/Formulario"));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apartamentos" element={<Listagem />} />
          <Route path="/apartamentos/:codigo" element={<Detalhe />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLista />} />
          <Route path="/admin/novo" element={<AdminFormulario />} />
          <Route path="/admin/:id" element={<AdminFormulario />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
