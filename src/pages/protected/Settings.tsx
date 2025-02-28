import {ThemeToggle} from "../../components/layout";

export default function Settings() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Impostazioni</h1>

            {/* Sezione Tema */}
            <div className="mt-6 p-4 rounded-lg bg-[var(--color-bg-soft)] shadow-md glass">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">Tema</h2>
                <p className="text-[var(--color-text-soft)] text-sm">Scegli tra modalità chiara e scura.</p>
                <div className="mt-4 flex justify-start items-center gap-3">
                    <ThemeToggle/>
                    <span className="text-[var(--color-text)] text-lg">
          </span>
                </div>
            </div>
        </div>
    );
}
