import {Outlet} from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import {Breadcrumbs} from "./index.tsx";

export default function MainLayout() {
    return (
        <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
            {/* Sidebar */}
            <Sidebar/>

            {/* Contenuto principale */}
            <div className="flex flex-col flex-1">
                {/* Navbar */}
                <Navbar/>

                {/* Breadcrumbs come titolo di pagina */}
                <div className="px-6 pt-4">
                    <Breadcrumbs/>
                </div>

                {/* Contenuto dinamico delle pagine */}
                <main className="p-4 md:p-6 overflow-y-auto min-h-[calc(100vh-56px)]">
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}