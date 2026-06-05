import { isAdmin, getSession } from "@/utils";

export default function ReservationCard(reservation) {
  const { id, workspace, date, startHour, endHour, reason, status, userId, people } = reservation;
  const user = getSession();
  const canEdit = isAdmin() || (user.id == userId && status === "pending");
  const canDelete = isAdmin();
  const canApprove = isAdmin() && status === "pending";
  const canCancel = isAdmin() || (user.id == userId && (status === "pending" || status === "approved"));

  return `
    <article class="rounded bg-white p-3">
      <h3 class="font-bold text-lg">${workspace}</h3>

      <div class="">
        <p>Fecha: ${date}</p>
        <p>Horario: ${startHour} - ${endHour}</p>
        <p>Personas: ${people || "—"}</p>
        <p>Motivo: ${reason}</p>
        <p>Estado: <span class="">${status}</span></p>
      </div>

      <div class="flex gap-2 mt-2" id="actions-${id}">
        ${canEdit ? `<button class="edit-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${id}">Editar</button>` : ""}
        ${canDelete ? `<button class="delete-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${id}">Eliminar</button>` : ""}
        ${canApprove ? `<button class="approve-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${id}">Aprobar</button>` : ""}
        ${canApprove ? `<button class="reject-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${id}">Rechazar</button>` : ""}
        ${canCancel ? `<button class="cancel-btn border border-black text-black px-3 py-1 rounded text-sm cursor-pointer" data-id="${id}">Cancelar</button>` : ""}
      </div>
    </article>
  `;
}
