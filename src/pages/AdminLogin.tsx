import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const AUTH_KEY = "wedding_admin_auth";
const CHECK_URL = "https://functions.poehali.dev/a20d2510-dbb5-48dd-9faf-c45e0a14bc04";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Пробуем сохранить пустой ping — если пароль верный, сервер ответит 200
      const res = await fetch(CHECK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": password },
        body: JSON.stringify({ __ping: true }),
      });
      if (res.status === 403) {
        setError("Неверный пароль");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Сервер недоступен. Попробуйте позже.");
        setLoading(false);
        return;
      }
      localStorage.setItem(AUTH_KEY, "true");
      localStorage.setItem("wedding_admin_token", password);
      navigate("/admin/panel");
    } catch {
      setError("Ошибка сети. Проверьте соединение.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.5em] text-[#B8976A] font-montserrat uppercase mb-2">Свадебный сайт</p>
          <h1 className="font-cormorant text-4xl font-light text-[#3D2B1F]">Панель управления</h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#B8976A] to-transparent mx-auto mt-4" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-white border border-[#E8D5BE] p-8 rounded-sm space-y-5"
          style={{ boxShadow: "0 8px 50px rgba(61,43,31,0.08)" }}>

          <div>
            <label className="block text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-2">
              Логин
            </label>
            <div className="relative">
              <Icon name="User" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8878]" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full pl-9 pr-4 py-3 border border-[#E8D5BE] bg-transparent text-sm text-[#4A4035] font-montserrat focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.3em] text-[#B8976A] font-montserrat uppercase mb-2">
              Пароль
            </label>
            <div className="relative">
              <Icon name="Lock" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8878]" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-3 border border-[#E8D5BE] bg-transparent text-sm text-[#4A4035] font-montserrat focus:outline-none focus:border-[#B8976A] rounded-sm transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8878] hover:text-[#4A4035] transition-colors">
                <Icon name={showPass ? "EyeOff" : "Eye"} size={15} />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs font-montserrat bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
              <Icon name="AlertCircle" size={13} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#3D2B1F] text-[#FAF7F2] text-[10px] tracking-[0.35em] font-montserrat uppercase hover:bg-[#4A4035] transition-colors rounded-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#FAF7F2]/40 border-t-[#FAF7F2] rounded-full animate-spin" />
                Вход...
              </>
            ) : "Войти"}
          </button>
        </form>

        <p className="text-center text-xs text-[#9B8878] font-montserrat mt-6">
          <button onClick={() => navigate("/")} className="hover:text-[#B8976A] transition-colors inline-flex items-center gap-1">
            <Icon name="ArrowLeft" size={12} />
            Вернуться на сайт
          </button>
        </p>
      </div>
    </div>
  );
}