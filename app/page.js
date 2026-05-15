export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to BobWatch
        </h1>
        <p className="text-center text-lg mb-8">
          AI-powered code analysis tool
        </p>
        <div className="flex justify-center">
          <a
            href="/results"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View Results
          </a>
        </div>
      </div>
    </main>
  );
}

// Made with Bob
