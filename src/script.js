tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#1a1a1a",
                "background-light": "#f5f5f5",
                "background-dark": "#121212",
                "accent-light": "#e0e0e0",
                "accent-dark": "#333333",
            },
            fontFamily: {
                display: ["'Syncopate'", "sans-serif"],
                body: ["'Inter'", "sans-serif"],
                japanese: ["'Noto Serif JP'", "serif"],
            },  
            borderRadius: {
                DEFAULT: "0px",
            },
            spacing: {
                '128': '32rem',
            }
        },
    },
}