import Sidebar from "@/components/Sidebar";
import { workspacesController } from "@/controllers/workspaces.controller";

export default function workspacesView() {
  setTimeout(() => {
    workspacesController();
  });

  return `
    <div class="flex">
      ${Sidebar()}
      <main class="flex-1 p-6 bg-slate-100 min-h-screen ml-64">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Gestión de Espacios</h1>
          <button id="newWorkspaceBtn" class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">Nuevo Espacio</button>
        </div>
        <div id="workspacesContainer" class="bg-white p-5 rounded-lg shadow grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div class="text-center py-4 col-span-full text-emerald-800">Cargando espacios ...</div>
        </div>
      </main>
    </div>

    <div id="modalOverlay" class="fixed inset-0 bg-black/50 z-40 hidden flex items-center justify-center">
      <div id="modalContent" class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"></div>
    </div>
  `;
}
