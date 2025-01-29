import "./globals.css";



export const metadata = {
  title: 'GitHub Universe Explorer',
  description: 'Discover developers in a new dimension',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-space-black via-[#1A1A2E] to-[#0F3460] relative overflow-auto ">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
