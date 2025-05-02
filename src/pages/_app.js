import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-golf-green text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Golf Scorecard</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <Component {...pageProps} />
      </main>
      
      <footer className="bg-gray-200 p-4 text-center text-gray-600">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Golf Scorecard App</p>
        </div>
      </footer>
    </div>
  )
}

export default MyApp 