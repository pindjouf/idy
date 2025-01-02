/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        gruvbox: {
          bg: 'rgb(29, 32, 33)',        // dark0_hard
          'bg-soft': 'rgb(40, 40, 40)', // dark0
          'bg-hard': 'rgb(50, 48, 47)', // dark0_soft
          fg: 'rgb(235, 219, 178)',     // light0
          gray: 'rgb(168, 153, 132)',   // gray_245
          red: 'rgb(251, 73, 52)',      // red
          green: 'rgb(184, 187, 38)',   // green
          yellow: 'rgb(250, 189, 47)',  // yellow
          blue: 'rgb(131, 165, 152)',   // blue
          purple: 'rgb(211, 134, 155)', // purple
          aqua: 'rgb(142, 192, 124)',   // aqua
          orange: 'rgb(254, 128, 25)'   // orange
        }
      },
      backgroundSize: {
        '300%': '300% 300%'
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'blob': "blob 7s infinite",
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          }
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)"
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)"
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)"
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)"
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-20px)'
          }
        },
        glow: {
          '0%': {
            filter: 'brightness(1) drop-shadow(0 0 0 rgba(131,165,152,0))'
          },
          '100%': {
            filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(131,165,152,0.3))'
          }
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(131,165,152,0.3)',
        'glow-lg': '0 0 30px rgba(131,165,152,0.4)',
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
        '.mask-fade-y': {
          'mask-image': 'linear-gradient(to bottom, black 0%, transparent 100%)'
        },
        '.bg-gradient-glow': {
          'background': 'linear-gradient(45deg, rgba(131,165,152,0.1) 0%, rgba(142,192,124,0.1) 100%)'
        }
      }
      addUtilities(newUtilities)
    }
  ]
}
