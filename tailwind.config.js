/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            // TODO: this doesn't really change our font...
            fontFamily: {
                'times': ['"Times New Roman"', 'Times', 'serif'],
            },
        }
    },
    plugins: [],
}