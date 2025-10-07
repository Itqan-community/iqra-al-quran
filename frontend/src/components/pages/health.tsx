export function HealthPage() {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "iqra-al-quran-frontend",
    version: "1.0.0"
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Service Healthy</h1>
        </div>
        
        <div className="bg-muted rounded-lg p-4 text-left max-w-md">
          <pre className="text-sm font-mono">
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          This endpoint is used by Railway for health checks
        </p>
      </div>
    </div>
  )
}
