import { memo } from "react";
import { useAuthorizationPage } from "./authorization.hook";

const AuthorizationPage = memo(() => {
  const hook = useAuthorizationPage();

  return (
    <div className="flex flex-col gap-2 min-w-96 max-w-96">
      {hook.error && (
        <p className="bg-red-500 text-white p-2 rounded font-medium w-full">
          Ошибка: {hook.error.message}
        </p>
      )}

      <form className="bg-white p-8 rounded  w-full" onSubmit={hook.handleSubmit(hook.onSubmit)}>
        <h2 className="text-2xl font-bold mb-6 text-center">Авторизация</h2>

        {/* Поле email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            {...hook.register("email")}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
              hook.errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-black"
            }`}
            placeholder="Введите email"
          />
          {hook.errors.email && (
            <p className="text-red-500 text-sm mt-1">{hook.errors.email.message}</p>
          )}
        </div>

        {/* Поле password */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Пароль:
          </label>
          <div className="relative">
            <input
              type={hook.showPassword ? "text" : "password"}
              id="password"
              {...hook.register("password")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                hook.errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-black"
              }`}
              placeholder="Введите пароль"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-sm text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer"
              onClick={hook.togglePasswordVisibility}
            >
              {hook.showPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
          {hook.errors.password && (
            <p className="text-red-500 text-sm mt-1">{hook.errors.password.message}</p>
          )}
        </div>

        <button
          disabled={hook.isPending}
          type="submit"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-800 transition duration-200 cursor-pointer"
        >
          {hook.isPending ? "Загрузка..." : "Войти"}
        </button>
      </form>

      <button
        onClick={() => hook.setAuthStep("registration")}
        className="text-sm text-blue-500 hover:underline focus:outline-none cursor-pointer"
      >
        <span className="text-black">Еще не зарегистрированы?</span> Зарегистрироваться!
      </button>
    </div>
  );
});

export default AuthorizationPage;
