import { memo } from "react";
import { useConfirmEmailPage } from "./confirm-email.hook";

const ConfirmEmailPage = memo(() => {
  const hook = useConfirmEmailPage();
  return (
    <div className="max-w-96 min-w-96 flex flex-col gap-2">
      {hook.confirmEmailMutation.error && (
        <p className="bg-red-500 text-white p-2 rounded font-medium w-full">
          Ошибка: {hook.confirmEmailMutation.error.message}
        </p>
      )}

      {hook.resendConfirmEmailTokenMutation.error && (
        <p className="bg-red-500 text-white p-2 rounded font-medium w-full">
          Ошибка: {hook.resendConfirmEmailTokenMutation.error.message}
        </p>
      )}

      <div className="flex flex-col gap-2 p-8 text-center bg-white rounded">
        <h2 className="text-2xl font-bold mb-6">Подтвердите ваш email</h2>
        <p className="text-gray-700 mb-4">
          Мы отправили письмо с подтверждением на адрес{" "}
          <span className="font-bold">{hook.user?.email}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Введите код из письма для завершения подтверждения вашего email.
        </p>

        {/* Форма */}
        <form className="text-left" onSubmit={hook.handleSubmit(hook.onSubmit)}>
          <div className="mb-4">
            <label htmlFor="token" className="block text-gray-700 text-sm font-bold mb-2">
              Код:
            </label>
            <input
              type="text"
              id="confirmEmailToken"
              {...hook.register("confirmEmailToken")}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                hook.errors.confirmEmailToken
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-black"
              }`}
              placeholder="Введите код"
            />
            {hook.errors.confirmEmailToken && (
              <p className="text-red-500 text-sm mt-1">{hook.errors.confirmEmailToken.message}</p>
            )}
          </div>

          <button
            disabled={
              hook.confirmEmailMutation.isPending || hook.resendConfirmEmailTokenMutation.isPending
            }
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-800 transition duration-200 cursor-pointer mb-2"
          >
            Подтвердить почту
          </button>
        </form>

        <div className="mt-4">
          <p className="text-red-600 text-sm font-medium">Не получили письмо?</p>
          {hook.timer > 0 && (
            <p className="text-gray-600 text-sm">
              Повторная отправка возможна через {hook.timer} секунд.
            </p>
          )}
          {hook.canResend && (
            <button
              disabled={hook.resendConfirmEmailTokenMutation.isPending}
              onClick={hook.handleResendEmail}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline mt-1 cursor-pointer"
            >
              {hook.resendConfirmEmailTokenMutation.isPending
                ? "Отправка..."
                : "Отправить повторно"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ConfirmEmailPage;
