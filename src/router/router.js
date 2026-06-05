import loginView from "@/views/loginView";
import homeView from "@/views/homeView";
import workspacesView from "@/views/workspacesView";
import NotFoundView from "@/views/notFound";
import { isAuthenticated, isAdmin } from "@/utils";

const routes = {
  "/": { render: loginView, protected: false },
  "/home": { render: homeView, protected: true },
  "/workspaces": { render: workspacesView, protected: true, adminOnly: true },
};

const isRouteAllowed = (route) => {
  if (!route) return false;
  if (route.protected && !isAuthenticated()) return false;
  if (route.adminOnly && !isAdmin()) return false;
  return true;
};

export const navigateTo = (path) => {
  history.pushState({}, "", path);
  router();
};

export const router = () => {
  const app = document.querySelector("#app");
  let path = window.location.pathname;

  if (!isAuthenticated() && path !== "/") {
    navigateTo("/");
    return;
  }

  if (isAuthenticated() && path === "/") {
    navigateTo("/home");
    return;
  }

  const route = routes[path];

  if (!route || !isRouteAllowed(route)) {
    if (isAuthenticated()) {
      navigateTo("/home");
      return;
    }
    app.innerHTML = NotFoundView();
    return;
  }

  app.innerHTML = route.render();
};

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-link]");
  if (link) {
    e.preventDefault();
    const href = link.getAttribute("href");
    if (href) navigateTo(href);
  }
});

window.addEventListener("popstate", router);
