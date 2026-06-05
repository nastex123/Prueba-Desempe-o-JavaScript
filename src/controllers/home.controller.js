import ReservationCard from "@components/ReservationCard";
import { getReservations, createReservation, updateReservation, deleteReservation, patchReservation } from "@services/reservation.service";
import { getWorkspaces } from "@services/workspace.service";
import { getSession } from "@/utils";
import { showNotification } from "@components/Notification";

const hasTimeOverlap = (existing, newStart, newEnd) => {
  return existing.startHour < newEnd && existing.endHour > newStart;
};

const hasDuplicate = (reservations, workspaceId, date, startHour, endHour, excludeId) => {
  return reservations.some((r) =>
    r.id != excludeId &&
    r.workspaceId == workspaceId &&
    r.date === date &&
    r.status !== "cancelled" &&
    r.status !== "rejected" &&
    hasTimeOverlap(r, startHour, endHour)
  );
};

export const homeController = async () => {
  const container = document.querySelector("#reservationsContainer");
  const searchInput = document.querySelector("#searchInput");
  const statusFilter = document.querySelector("#statusFilter");
  const newResBtn = document.querySelector("#newReservationBtn");
  const user = getSession();
  let allReservations = [];

  const loadReservations = async () => {
    const reservations = await getReservations();
    allReservations = user.role === "admin"
      ? reservations
      : reservations.filter((r) => r.userId == user.id);
    renderReservations();
  };

  const renderReservations = () => {
    const search = (searchInput?.value || "").toLowerCase();
    const status = statusFilter?.value || "";

    const filtered = allReservations.filter((r) => {
      const matchSearch = r.workspace.toLowerCase().includes(search);
      const matchStatus = !status || r.status === status;
      return matchSearch && matchStatus;
    });

    container.innerHTML = filtered.length
      ? filtered.map((r) => ReservationCard(r)).join("")
      : `<div class="w-full text-center py-8 col-span-2"><p class="text-slate-500">No hay reservas disponibles</p></div>`;

    attachActionListeners();
  };

  const attachActionListeners = () => {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleDelete(btn.dataset.id));
    });
    document.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => handlePatchStatus(btn.dataset.id, "approved"));
    });
    document.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => handlePatchStatus(btn.dataset.id, "rejected"));
    });
    document.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => handlePatchStatus(btn.dataset.id, "cancelled"));
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta reserva?")) return;
    try {
      await deleteReservation(id);
      showNotification("Reserva eliminada exitosamente");
      loadReservations();
    } catch {
      showNotification("Error al eliminar la reserva", "error");
    }
  };

  const handlePatchStatus = async (id, status) => {
    try {
      await patchReservation(id, { status });
      showNotification(`Reserva ${status === "approved" ? "aprobada" : status === "rejected" ? "rechazada" : "cancelada"} exitosamente`);
      loadReservations();
    } catch {
      showNotification("Error al actualizar la reserva", "error");
    }
  };

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

  const renderWorkspaceOptions = (list, selectedId) => {
    return list.map((w) =>
      `<option value="${w.id}" ${w.id == selectedId ? "selected" : ""}>${w.name} (${w.type} - ${w.capacity} pers.)</option>`
    ).join("");
  };

  const updateWorkspaceSelect = (selectEl, allWS, people) => {
    const prevVal = selectEl.value;
    const filtered = allWS.filter((w) => w.capacity >= people);
    const html = filtered.length
      ? filtered.map((w) =>
          `<option value="${w.id}" ${w.id == prevVal ? "selected" : ""}>${w.name} (${w.type} - ${w.capacity} pers.)</option>`
        ).join("")
      : `<option value="">${people ? "Sin espacios disponibles" : "Ingrese número de personas"}</option>`;
    selectEl.innerHTML = html;
  };

  const openCreateModal = async () => {
    const workspaces = await getWorkspaces();
    const allRes = await getReservations();

    openModal(`
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Nueva Reserva</h2>
        <button id="closeModal" class="text-slate-400 text-2xl cursor-pointer">&times;</button>
      </div>
      <form id="reservationForm">
        <div class="mb-3">
          <label class="block mb-1">Número de personas</label>
          <input type="number" id="peopleInput" name="people" min="1" required class="border w-full p-2 rounded" placeholder="Ej: 4">
        </div>
        <div class="mb-3">
          <label class="block mb-1">Espacio sugerido</label>
          <select name="workspace" required class="border w-full p-2 rounded">
            <option value="">Ingrese número de personas</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="block mb-1">Fecha</label>
          <input type="date" name="date" required class="border w-full p-2 rounded">
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block mb-1">Hora inicio</label>
            <input type="time" name="startHour" required class="border w-full p-2 rounded">
          </div>
          <div>
            <label class="block mb-1">Hora fin</label>
            <input type="time" name="endHour" required class="border w-full p-2 rounded">
          </div>
        </div>
        <div class="mb-4">
          <label class="block mb-1">Motivo</label>
          <textarea name="reason" required class="border w-full p-2 rounded" rows="3"></textarea>
        </div>
        <button type="submit" class="border border-black text-black w-full py-2 rounded cursor-pointer">Crear Reserva</button>
      </form>
    `);

    const peopleInput = document.querySelector("#peopleInput");
    const wsSelect = document.querySelector("[name='workspace']");

    peopleInput.addEventListener("input", () => {
      const p = Number(peopleInput.value);
      if (p > 0) {
        updateWorkspaceSelect(wsSelect, workspaces, p);
      } else {
        wsSelect.innerHTML = `<option value="">Ingrese número de personas</option>`;
      }
    });

    document.querySelector("#reservationForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const people = Number(form.people.value);
      const wsId = form.workspace.value;
      const selectedWorkspace = workspaces.find((w) => w.id == wsId);
      const date = form.date.value;
      const startHour = form.startHour.value;
      const endHour = form.endHour.value;

      if (!people || people < 1) {
        showNotification("Ingrese un número de personas válido", "error");
        return;
      }

      if (!selectedWorkspace) {
        showNotification("Seleccione un espacio válido", "error");
        return;
      }

      if (selectedWorkspace.capacity < people) {
        showNotification("El espacio no tiene capacidad suficiente", "error");
        return;
      }

      if (!date || !startHour || !endHour) {
        showNotification("Complete todos los campos", "error");
        return;
      }

      if (hasDuplicate(allRes, wsId, date, startHour, endHour, null)) {
        showNotification("El espacio ya está reservado en ese horario", "error");
        return;
      }

      try {
        await createReservation({
          userId: user.id,
          workspaceId: wsId,
          workspace: selectedWorkspace.name,
          date,
          startHour,
          endHour,
          reason: form.reason.value,
          people,
          status: "pending",
        });
        showNotification("Reserva creada exitosamente");
        document.querySelector("#modalOverlay").classList.add("hidden");
        loadReservations();
      } catch (err) {
        console.error("Error al crear reserva:", err);
        showNotification("Error al crear la reserva", "error");
      }
    });
  };

  const openEditModal = async (id) => {
    const reservation = allReservations.find((r) => r.id == id);
    if (!reservation) return;
    const workspaces = await getWorkspaces();
    const allRes = await getReservations();
    const peopleCount = reservation.people || 1;
    const filteredWS = workspaces.filter((w) => w.capacity >= Math.max(peopleCount, 1));

    openModal(`
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Editar Reserva</h2>
        <button id="closeModal" class="text-slate-400 text-2xl cursor-pointer">&times;</button>
      </div>
      <form id="reservationForm">
        <div class="mb-3">
          <label class="block mb-1">Número de personas</label>
          <input type="number" id="peopleInput" name="people" min="1" value="${peopleCount}" required class="border w-full p-2 rounded">
        </div>
        <div class="mb-3">
          <label class="block mb-1">Espacio</label>
          <select name="workspace" required class="border w-full p-2 rounded">
            ${renderWorkspaceOptions(filteredWS, reservation.workspaceId)}
          </select>
        </div>
        <div class="mb-3">
          <label class="block mb-1">Fecha</label>
          <input type="date" name="date" value="${reservation.date}" required class="border w-full p-2 rounded">
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block mb-1">Hora inicio</label>
            <input type="time" name="startHour" value="${reservation.startHour}" required class="border w-full p-2 rounded">
          </div>
          <div>
            <label class="block mb-1">Hora fin</label>
            <input type="time" name="endHour" value="${reservation.endHour}" required class="border w-full p-2 rounded">
          </div>
        </div>
        <div class="mb-4">
          <label class="block mb-1">Motivo</label>
          <textarea name="reason" required class="border w-full p-2 rounded" rows="3">${reservation.reason}</textarea>
        </div>
        <button type="submit" class="border border-black text-black w-full py-2 rounded cursor-pointer">Guardar Cambios</button>
      </form>
    `);

    const peopleInput = document.querySelector("#peopleInput");
    const wsSelect = document.querySelector("[name='workspace']");

    peopleInput.addEventListener("input", () => {
      const p = Number(peopleInput.value);
      if (p > 0) {
        updateWorkspaceSelect(wsSelect, workspaces, p);
      } else {
        wsSelect.innerHTML = `<option value="">Ingrese número de personas</option>`;
      }
    });

    document.querySelector("#reservationForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const people = Number(form.people.value);
      const wsId = form.workspace.value;
      const selectedWorkspace = workspaces.find((w) => w.id == wsId);
      const date = form.date.value;
      const startHour = form.startHour.value;
      const endHour = form.endHour.value;

      if (!people || people < 1) {
        showNotification("Ingrese un número de personas válido", "error");
        return;
      }

      if (!selectedWorkspace) {
        showNotification("Seleccione un espacio válido", "error");
        return;
      }

      if (selectedWorkspace.capacity < people) {
        showNotification("El espacio no tiene capacidad suficiente", "error");
        return;
      }

      if (!date || !startHour || !endHour) {
        showNotification("Complete todos los campos", "error");
        return;
      }

      if (hasDuplicate(allRes, wsId, date, startHour, endHour, id)) {
        showNotification("El espacio ya está reservado en ese horario", "error");
        return;
      }

      try {
        await updateReservation(id, {
          ...reservation,
          workspaceId: wsId,
          workspace: selectedWorkspace.name,
          date,
          startHour,
          endHour,
          reason: form.reason.value,
          people,
        });
        showNotification("Reserva actualizada exitosamente");
        document.querySelector("#modalOverlay").classList.add("hidden");
        loadReservations();
      } catch (err) {
        console.error("Error al actualizar reserva:", err);
        showNotification("Error al actualizar la reserva", "error");
      }
    });
  };

  // ── Event listeners ──

  searchInput?.addEventListener("input", renderReservations);
  statusFilter?.addEventListener("change", renderReservations);
  newResBtn?.addEventListener("click", openCreateModal);

  await loadReservations();
};
