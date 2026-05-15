export default function Results() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-8">Analysis Results</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Code Analysis</h2>
          <p className="text-gray-300">
            Your analysis results will appear here.
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <a
            href="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}

// Made with Bob
