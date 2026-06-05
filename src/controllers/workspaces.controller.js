import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from "@services/workspace.service";
import { showNotification } from "@components/Notification";

const openModal = (html) => {
  const overlay = document.querySelector("#modalOverlay");
  const content = document.querySelector("#modalContent");
  content.innerHTML = html;
  overlay.classList.remove("hidden");
  document.querySelector("#closeModal")?.addEventListener("click", () => overlay.classList.add("hidden"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.add("hidden");
  });
};

export const workspacesController = async () => {
  const loadWorkspaces = async () => {
    const wsContainer = document.querySelector("#workspacesContainer");
    if (!wsContainer) return;
    const workspaces = await getWorkspaces();

    if (!workspaces.length) {
      wsContainer.innerHTML = `<div class="text-center py-4 col-span-full text-slate-500">No hay espacios disponibles</div>`;
      return;
    }

    wsContainer.innerHTML = workspaces.map((w) => `
      <article class="rounded bg-white p-3">
        <h3 class="font-bold text-lg">${w.name}</h3>
        <div>
          <p>Tipo: ${w.type}</p>
          <p>Capacidad: ${w.capacity} personas</p>
          <p>Ubicación: ${w.location}</p>
        </div>
        <div class="flex gap-2 mt-2">
          <button class="edit-ws-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${w.id}">Editar</button>
          <button class="delete-ws-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${w.id}">Eliminar</button>
        </div>
      </article>
    `).join("");

    document.querySelectorAll(".edit-ws-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditWorkspaceModal(btn.dataset.id));
    });
    document.querySelectorAll(".delete-ws-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleDeleteWorkspace(btn.dataset.id));
    });
  };

  const handleDeleteWorkspace = async (id) => {
    if (!confirm("¿Eliminar este espacio?")) return;
    try {
      await deleteWorkspace(id);
      showNotification("Espacio eliminado exitosamente");
      loadWorkspaces();
    } catch {
      showNotification("Error al eliminar el espacio", "error");
    }
  };

  const openCreateWorkspaceModal = () => {
    openModal(`
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Nuevo Espacio</h2>
        <button id="closeModal" class="text-slate-400 text-2xl cursor-pointer">&times;</button>
      </div>
      <form id="workspaceForm">
        <div class="mb-3">
          <label class="block mb-1">Nombre</label>
          <input type="text" name="name" required class="border w-full p-2 rounded">
        </div>
        <div class="mb-3">
          <label class="block mb-1">Tipo</label>
          <select name="type" required class="border w-full p-2 rounded">
            <option value="">Seleccione un tipo</option>
            <option value="Sala de reuniones">Sala de reuniones</option>
            <option value="Oficina privada">Oficina privada</option>
            <option value="Espacio de coworking">Espacio de coworking</option>
            <option value="Auditorio">Auditorio</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block mb-1">Capacidad</label>
          <input type="number" name="capacity" min="1" required class="border w-full p-2 rounded">
        </div>
        <div class="mb-4">
          <label class="block mb-1">Ubicación</label>
          <input type="text" name="location" required class="border w-full p-2 rounded">
        </div>
        <button type="submit" class="border border-black text-black w-full py-2 rounded cursor-pointer">Crear Espacio</button>
      </form>
    `);

    document.querySelector("#workspaceForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      try {
        await createWorkspace({
          name: form.name.value,
          type: form.type.value,
          capacity: Number(form.capacity.value),
          location: form.location.value,
        });
        showNotification("Espacio creado exitosamente");
        document.querySelector("#modalOverlay").classList.add("hidden");
        loadWorkspaces();
      } catch {
        showNotification("Error al crear el espacio", "error");
      }
    });
  };

  const openEditWorkspaceModal = async (id) => {
    const workspaces = await getWorkspaces();
    const ws = workspaces.find((w) => w.id == id);
    if (!ws) return;

    openModal(`
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Editar Espacio</h2>
        <button id="closeModal" class="text-slate-400 text-2xl cursor-pointer">&times;</button>
      </div>
      <form id="workspaceForm">
        <div class="mb-3">
          <label class="block mb-1">Nombre</label>
          <input type="text" name="name" value="${ws.name}" required class="border w-full p-2 rounded">
        </div>
        <div class="mb-3">
          <label class="block mb-1">Tipo</label>
          <select name="type" required class="border w-full p-2 rounded">
            <option value="">Seleccione un tipo</option>
            <option value="Sala de reuniones" ${ws.type === "Sala de reuniones" ? "selected" : ""}>Sala de reuniones</option>
            <option value="Oficina privada" ${ws.type === "Oficina privada" ? "selected" : ""}>Oficina privada</option>
            <option value="Espacio de coworking" ${ws.type === "Espacio de coworking" ? "selected" : ""}>Espacio de coworking</option>
            <option value="Auditorio" ${ws.type === "Auditorio" ? "selected" : ""}>Auditorio</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block mb-1">Capacidad</label>
          <input type="number" name="capacity" value="${ws.capacity}" min="1" required class="border w-full p-2 rounded">
        </div>
        <div class="mb-4">
          <label class="block mb-1">Ubicación</label>
          <input type="text" name="location" value="${ws.location}" required class="border w-full p-2 rounded">
        </div>
        <button type="submit" class="border border-black text-black w-full py-2 rounded cursor-pointer">Guardar Cambios</button>
      </form>
    `);

    document.querySelector("#workspaceForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      try {
        await updateWorkspace(id, {
          ...ws,
          name: form.name.value,
          type: form.type.value,
          capacity: Number(form.capacity.value),
          location: form.location.value,
        });
        showNotification("Espacio actualizado exitosamente");
        document.querySelector("#modalOverlay").classList.add("hidden");
        loadWorkspaces();
      } catch {
        showNotification("Error al actualizar el espacio", "error");
      }
    });
  };

  document.querySelector("#newWorkspaceBtn")?.addEventListener("click", openCreateWorkspaceModal);

  await loadWorkspaces();
};
