import Sidebar from "@/components/Sidebar";
import { getSession } from "@/utils";
import { homeController } from "@/controllers/home.controller";

export default function homeView() {
  const user = getSession();

  setTimeout(() => {
    homeController();
  });

  return `
    <div class="flex">
      ${Sidebar()}
      <main class="flex-1 p-6 bg-slate-100 min-h-screen ml-64">
        <h1 class="text-sm font-bold">
          Bienvenido ${user?.name}
        </h1>

        <p class="text-orange-900">
          Rol: ${user?.role}
        </p>

        <div class="flex gap-3 my-4 flex-wrap">
          <input type="text" id="searchInput" placeholder="Buscar por espacio..." class="border p-2 rounded text-sm flex-1 min-w-40">
          <select id="statusFilter" class="border p-2 rounded text-sm">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button id="newReservationBtn" class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
            Nueva Reserva
          </button>
        </div>

        <section class="bg-white p-5 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-xl">Reservas</h2>
            <span class="text-sm text-slate-500">
              ${user.role === "admin" ? "Mostrando todas las reservas" : "Mostrando únicamente tus reservas"}
            </span>
          </div>
          <div id="reservationsContainer" class="grid gap-4 md:grid-cols-2">
            <div class="w-full text-center py-8 col-span-2">
              <p class="text-emerald-800">Cargando reservas ...</p>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div id="modalOverlay" class="fixed inset-0 bg-black/50 z-40 hidden flex items-center justify-center">
      <div id="modalContent" class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"></div>
    </div>
  `;
}
