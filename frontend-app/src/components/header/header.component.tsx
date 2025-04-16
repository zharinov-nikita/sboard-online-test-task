import { memo } from "react";
import { useHeader } from "./header.hook";

export const HeaderComponent = memo(() => {
  const hook = useHeader();

  return (
    <div className="w-full flex flex-col bg-gray-200 px-4 py-3">
      <header className="w-full">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="28"
                className="sm:w-[120px] sm:h-[32px]"
                viewBox="0 0 850 226"
                fill="none"
              >
                {" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M77.3757 167.648C56.7238 188.301 61.2574 209.632 77.1274 225.77L112.741 190.155L150.704 152.193L157.133 145.764C177.786 125.112 173.251 103.781 157.381 87.6426L121.767 123.257L83.8049 161.219L77.3757 167.648Z"
                  fill="#FF823E"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.5359 80.0055C-6.11646 100.658 -1.58266 121.989 14.2874 138.127L49.9013 102.513L87.8636 64.5504L94.2928 58.1212C114.946 37.4689 110.411 16.138 94.5411 0L58.9272 35.6141L20.9651 73.5763L14.5359 80.0055Z"
                  fill="#FF823E"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M81.0441 146.612C60.3914 167.265 39.0606 162.731 22.9221 146.861L58.5369 111.247L84.1442 85.6399L90.5735 79.2106C111.225 58.5579 132.557 63.0915 148.695 78.9615L113.081 114.575L87.4733 140.183L81.0441 146.612Z"
                  fill="#FF823E"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M233 84C224.888 84 217.687 87.1931 212.272 92.4547C208.707 95.9186 203.009 95.8367 199.545 92.2719C196.081 88.707 196.163 83.0091 199.728 79.5453C208.319 71.1978 219.954 66 233 66C259.441 66 281 87.7935 281 114C281 140.509 259.134 161 233 161C219.954 161 208.319 155.802 199.728 147.455C196.163 143.991 196.081 138.293 199.545 134.728C203.009 131.163 208.707 131.081 212.272 134.545C217.687 139.807 224.888 143 233 143C246.467 143 257.668 134.611 261.544 123H228C223.029 123 219 118.971 219 114C219 109.029 223.029 105 228 105H261.586C257.708 92.9464 246.299 84 233 84Z"
                  fill="#333333"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M343 143C351.112 143 358.313 139.807 363.728 134.545C367.293 131.081 372.991 131.163 376.455 134.728C379.919 138.293 379.837 143.991 376.272 147.455C367.681 155.802 356.046 161 343 161C316.559 161 295 139.206 295 113C295 86.4913 316.866 66 343 66C356.046 66 367.681 71.1978 376.272 79.5453C379.837 83.0091 379.919 88.707 376.455 92.2719C372.991 95.8367 367.293 95.9186 363.728 92.4547C358.313 87.1931 351.112 84 343 84C326.247 84 313 96.9827 313 113C313 129.319 326.554 143 343 143Z"
                  fill="#333333"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M550.5 84C534.208 84 521 97.2076 521 113.5C521 129.792 534.208 143 550.5 143C566.792 143 580 129.792 580 113.5C580 97.2076 566.792 84 550.5 84ZM503 113.5C503 87.2665 524.266 66 550.5 66C576.734 66 598 87.2665 598 113.5C598 139.734 576.734 161 550.5 161C524.266 161 503 139.734 503 113.5Z"
                  fill="#333333"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M762.252 90.2179C757.993 93.9456 755 99.6539 755 108V144H806V108C806 99.4632 803.12 93.748 799.115 90.0985C794.989 86.3394 788.808 84 781 84C773.173 84 766.666 86.3537 762.252 90.2179ZM824 144V108C824 95.059 819.448 84.2743 811.238 76.7932C803.148 69.4217 792.329 66 781 66C769.69 66 758.697 69.4074 750.396 76.6738C741.939 84.0767 737 94.8684 737 108V144H720C715.029 144 711 148.029 711 153V175C711 179.971 715.029 184 720 184C724.971 184 729 179.971 729 175V162H832V175C832 179.971 836.029 184 841 184C845.971 184 850 179.971 850 175V153C850 148.029 845.971 144 841 144H824Z"
                  fill="#333333"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M660 84C643.681 84 630 97.5582 630 114C630 130.442 643.681 144 660 144C676.017 144 689 130.749 689 114C689 97.2515 676.017 84 660 84ZM630 151.347C638.259 158.005 648.72 162 660 162C686.509 162 707 140.129 707 114C707 87.8712 686.509 66 660 66C633.793 66 612 87.5644 612 114V197C612 201.971 616.029 206 621 206C625.971 206 630 201.971 630 197V151.347Z"
                  fill="#333333"
                />{" "}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M488.374 113.774C488.374 140.007 467.108 161.274 440.874 161.274C414.641 161.274 393.374 140.007 393.374 113.774C393.043 104.902 392.628 85.6459 393.627 79.5958C394.625 72.1438 397.086 66.6141 398.192 64.7808C402.875 55.2808 431.665 28.4455 464.77 11.1131C469.127 8.72034 474.598 10.3124 476.991 14.6691C479.384 19.0259 477.792 24.4974 473.435 26.8902C436.416 47.484 422.033 63.4068 413.828 74.7206C421.946 68.2444 429.682 66.2738 440.874 66.2738C467.108 66.2738 488.374 87.5403 488.374 113.774ZM440.874 143.274C457.167 143.274 470.374 130.066 470.374 113.774C470.374 97.4814 457.167 84.2738 440.874 84.2738C424.582 84.2738 411.374 97.4814 411.374 113.774C411.374 130.066 424.582 143.274 440.874 143.274Z"
                  fill="#333333"
                />{" "}
              </svg>
              {hook.authStep === "completed" && (
                <span>
                  <span className="p-1 text-sm sm:text-base font-medium bg-orange-500 text-white rounded break-all">
                    {hook.user?.email}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <a
                className="bg-red-500 text-white rounded px-2 text-sm"
                href="https://hh.ru/resume/e834d51bff0ea2a2bd0039ed1f376448396b77"
                target="_blank"
              >
                Резюме
              </a>
              <a
                className="bg-blue-500 text-white rounded px-2 text-sm"
                href="https://t.me/NIKITA_NZT_48"
                target="_blank"
              >
                Telegram
              </a>
              <a
                className="bg-black text-white rounded px-2 text-sm"
                href="https://github.com/zharinov-nikita/sboard-online-test-task"
                target="_blank"
              >
                Github
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hook.authStep === "completed" ? (
              <button
                onClick={hook.handleLogout}
                className="w-full sm:w-auto bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-800 transition duration-200 cursor-pointer text-sm sm:text-base"
              >
                Выйти
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  onClick={hook.handleRegistration}
                  className="flex-1 sm:flex-none bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-800 transition duration-200 cursor-pointer text-sm sm:text-base"
                >
                  Регистрация
                </button>
                <button
                  onClick={hook.handleAuthorization}
                  className="flex-1 sm:flex-none bg-orange-100 text-orange-500 py-2 px-4 rounded hover:bg-orange-200 transition duration-200 cursor-pointer text-sm sm:text-base"
                >
                  Авторизация
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
});
