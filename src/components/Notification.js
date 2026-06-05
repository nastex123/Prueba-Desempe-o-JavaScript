export function showNotification(message, type = "success") {
  const existing = document.querySelector("#notification-container");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "notification-container";
  container.className = "fixed top-4 right-4 z-50";

  const bgColor = type === "success" ? "bg-emerald-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

  container.innerHTML = `
    <div class="${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-72">
      <p class="flex-1">${message}</p>
      <button class="text-white text-lg font-bold cursor-pointer">&times;</button>
    </div>
  `;

  document.body.appendChild(container);

  container.querySelector("button").addEventListener("click", () => container.remove());

  setTimeout(() => container.remove(), 4000);
}
