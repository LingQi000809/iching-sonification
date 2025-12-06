/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                'serif': ['Times New Roman', 'Georgia', 'serif']
            },
        }
    },
    plugins: [],
}