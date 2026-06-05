import { removeSession, getSession, isAdmin } from "@/utils";
import { navigateTo } from "@/router/router";

export default function Sidebar() {
  const user = getSession();
  const path = window.location.pathname;

  setTimeout(() => {
    document.querySelector("#logoutBtn")?.addEventListener("click", () => {
      removeSession();
      navigateTo("/");
    });
  });

  return `
    <aside class="w-64 bg-slate-900 text-white h-screen p-5 flex flex-col fixed top-0 left-0">
      <h2 class="text-2xl font-bold mb-8">
        Brandon
      </h2>

      <nav class="flex flex-col gap-2 flex-1">
        <a href="/home" data-link class="px-3 py-2 rounded-xl ${path === "/home" ? "bg-gray-500" : "hover:bg-gray-700"}">
          Dashboard
        </a>
        ${isAdmin() ? `
          <a href="/workspaces" data-link class="px-3 py-2 rounded-xl ${path === "/workspaces" ? "bg-gray-500" : "hover:bg-gray-700"}">
            Gestión de Espacios
          </a>
        ` : ""}
        <button
          id="logoutBtn"
          class="text-left cursor-pointer text-red-400 hover:text-white hover:bg-red-400 px-3 py-2 rounded-xl"
        >
          Cerrar sesión
        </button>
      </nav>
    </aside>
  `;
}
