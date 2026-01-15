import type { Config } from "tailwindcss"

export default {
    darkMode: "class",
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "1rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
            },
            colors: {
                border: "hsl(var(--color-border))",
                input: "hsl(var(--color-input))",
                ring: "hsl(var(--color-ring))",
                background: "hsl(var(--color-background))",
                foreground: "hsl(var(--color-foreground))",
                primary: {
                    DEFAULT: "hsl(var(--color-primary))",
                    foreground: "hsl(var(--color-primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--color-secondary))",
                    foreground: "hsl(var(--color-secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--color-destructive))",
                    foreground: "hsl(var(--color-destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--color-muted))",
                    foreground: "hsl(var(--color-muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--color-accent))",
                    foreground: "hsl(var(--color-accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--color-popover))",
                    foreground: "hsl(var(--color-popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--color-card))",
                    foreground: "hsl(var(--color-card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
            },
            boxShadow: {
                '2xs': 'var(--shadow-2xs)',
                xs: 'var(--shadow-xs)',
                sm: 'var(--shadow-sm)',
                DEFAULT: 'var(--shadow)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
                '2xl': 'var(--shadow-2xl)'
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config
