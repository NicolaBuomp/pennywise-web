import {ThemeToggle} from "../../components/layout";
import {Card} from "../../components/common";

export default function Settings() {
    return (
        <div className="p-2.5">
            {/* Sezione Tema */}
            <Card title='Tema' subtitle='Scegli tra modalità chiara e scura'>
                <div className="mt-4 flex justify-start items-center gap-3">
                    <ThemeToggle/>
                </div>
            </Card>
        </div>
    );
}
