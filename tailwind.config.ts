import type { Config } from "tailwindcss";

/**
 * Paleta extraída da identidade do Instituto Landim e da campanha
 * Histórias de Volta (variáveis CSS publicadas em
 * institutolandimhistorias.vercel.app e cores medidas nos arquivos de marca
 * em public/brand/). Ver docs/10-marca-e-identidade.md.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./modules/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        landim: {
          creme: "#FBF7F1",
          creme2: "#F4ECE0",
          linha: "#E9DFD1",
          texto: "#2A2031",
          suave: "#5F5568",
          ouro: "#D6B469",
          ouroClaro: "#ECD9AD",
          ouroTexto: "#8A6A2B",
          ouroTitulo: "#B08B40",
          roxo50: "#F4EEF6",
          roxo600: "#56236F",
          roxo700: "#3D1153",
          roxo800: "#330D45",
          roxo900: "#280A35",
          roxo950: "#1D0627",
          // Roxo do arquivo oficial do logotipo (logo-roxo-com-dourado).
          marca: "#29183D",
        },
        // Palco do visualizador: roxo profundo levemente dessaturado para a
        // anatomia (marfim/vermelho) ter contraste sem competir com a marca.
        palco: {
          fundo: "#140A1C",
          painel: "#1E1229",
          borda: "#34243F",
          texto: "#EDE6F1",
          suave: "#A89BB3",
        },
        clinico: {
          pendente: "#E0A93B",
          aprovado: "#4FA37A",
          ilustrativo: "#7FA6D6",
          desconforto: "#E07A5F",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "Times New Roman", "serif"],
        script: ["var(--font-script)", "Brush Script MT", "cursive"],
      },
      borderRadius: {
        landim: "20px",
      },
      boxShadow: {
        landim: "0 18px 40px -22px rgba(45, 10, 60, .45)",
        suave: "0 10px 30px -20px rgba(45, 10, 60, .35)",
      },
      transitionTimingFunction: {
        suave: "cubic-bezier(.22,.61,.36,1)",
      },
    },
  },
  plugins: [],
};
export default config;
