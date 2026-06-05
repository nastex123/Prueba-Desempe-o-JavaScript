import { loginController } from "@/controllers/login.controller";

export default function loginView() {
  setTimeout(() => {
    loginController();
  });

  return `
    <div class="min-h-screen flex justify-center items-center bg-slate-100">

      <div class="bg-white p-8 rounded-lg shadow w-96">

        <h1 class="text-3xl font-bold mb-5">
          Login
        </h1>

        <form id="loginForm">

          <input
            type="email"
            name="email"
            placeholder="Correo"
            class="border w-full p-2 rounded mb-3"
          >

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            class="border w-full p-2 rounded mb-4"
          >

          <label class="flex items-center gap-2 mb-4 text-sm cursor-pointer">
            <input type="checkbox" name="remember" class="cursor-pointer">
            Recordar sesión
          </label>

          <button
            class="bg-blue-600 text-white w-full py-2 rounded cursor-pointer"
          >
            Ingresar
          </button>

        </form>

      </div>

    </div>
  `;
}
