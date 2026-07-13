import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";


export default function ThemeToggle() {

  const { theme, toggleTheme } = useTheme();


  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-full
        bg-gray-200
        dark:bg-gray-700
      "
    >
      {
        theme === "dark"
        ? <Sun size={18}/>
        : <Moon size={18}/>
      }
    </button>
  );
}