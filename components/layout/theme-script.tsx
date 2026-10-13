/**
 * Se ejecuta de forma síncrona antes del primer paint: aplica .dark/.light según la preferencia
 * guardada ("light" | "dark" | "system") para evitar el flash de tema.
 */
const SCRIPT = `(function(){try{var t=localStorage.getItem("pxn:theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var c=document.documentElement.classList;c.toggle("dark",d);c.toggle("light",!d);}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
