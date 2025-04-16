import { Route, Routes, useNavigate } from "react-router";

import { HeaderComponent } from "./components/header/header.component";
import { useUserStore } from "./store/user.store";
import { lazy, Suspense, useEffect } from "react";

import { ErrorBoundary } from "react-error-boundary";

const RegistrationPage = lazy(() => import("./pages/registration/registration.page"));
const AuthorizationPage = lazy(() => import("./pages/authorization/authorization.page"));
const ConfirmEmailPage = lazy(() => import("./pages/confirm-email/confirm-email.page"));
const UploadImagePage = lazy(() => import("./pages/upload-image/upload-image.page"));

const routes = [
  {
    path: "/authorization",
    component: AuthorizationPage,
  },
  {
    path: "/registration",
    component: RegistrationPage,
  },
  {
    path: "/confirm-email",
    component: ConfirmEmailPage,
  },
  {
    path: "/upload-image",
    component: UploadImagePage,
  },
];

export const App: React.FC = () => {
  const { authStep, resetStore } = useUserStore((s) => s);
  const navigate = useNavigate();

  useEffect(() => {
    if (authStep === "completed") {
      navigate("/upload-image");
    } else {
      navigate(`/${authStep}`);
    }
  }, [navigate, authStep]);

  function handleError() {
    localStorage.clear();
    resetStore();
    window.location.reload();
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <div className="flex justify-center items-center min-h-screen flex-col gap-4">
          <div className="font-medium text-2xl">Что-то пошло не так</div>
          <button
            className="bg-red-500 p-2 flex items-center justify-center rounded text-white cursor-pointer"
            onClick={handleError}
          >
            Перезагрузить страницу
          </button>
        </div>
      )}
    >
      <div className="App">
        <HeaderComponent />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
          <Routes>
            {routes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
                        <p className="text-gray-600 font-medium">Загрузка...</p>
                      </div>
                    }
                  >
                    <Component />
                  </Suspense>
                }
              />
            ))}
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
};
