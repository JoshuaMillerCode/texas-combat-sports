"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"
import { CheckCircle, XCircle, QrCode, RotateCcw, Loader2 } from "lucide-react"

type ScanResult = {
  success: boolean
  message: string
  transaction?: any
}

export default function TicketScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/admin/login'
    }
  }, [isAuthenticated, authLoading])

  // Initialize scanner when scanning state changes
  useEffect(() => {
    if (isScanning) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (scannerRef.current) {
          scannerRef.current.clear()
        }

        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            showTorchButtonIfSupported: false,
            showZoomSliderIfSupported: false,
            defaultZoomValueIfSupported: 1,
          },
          /* verbose= */ false
        )

        try {
          scanner.render(onScanSuccess, onScanError)
          scannerRef.current = scanner
          setCameraError(null)
        } catch (error) {
          console.error('Error initializing scanner:', error)
          setCameraError('Failed to initialize camera. Please check permissions and try again.')
          setIsScanning(false)
        }
      }, 100)

      return () => clearTimeout(timer)
    } else {
      // Clean up scanner when not scanning
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (error) {
          console.error('Error clearing scanner:', error)
        }
        scannerRef.current = null
      }
    }
  }, [isScanning])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch (error) {
          console.error('Error clearing scanner on unmount:', error)
        }
      }
    }
  }, [])

  // Dynamic styling after scanner loads to fix visibility issues
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        const qrReader = document.getElementById('qr-reader')
        if (qrReader) {
          // Find all interactive elements and ensure they're visible
          const interactiveElements = qrReader.querySelectorAll('button, a, span[onclick], div[onclick], *[role="button"]')
          interactiveElements.forEach((element) => {
            const htmlElement = element as HTMLElement
            // Apply consistent styling to ensure visibility
            htmlElement.style.setProperty('background', '#3b82f6', 'important')
            htmlElement.style.setProperty('color', 'white', 'important')
            htmlElement.style.setProperty('border', '1px solid #2563eb', 'important')
            htmlElement.style.setProperty('padding', '8px 16px', 'important')
            htmlElement.style.setProperty('border-radius', '6px', 'important')
            htmlElement.style.setProperty('margin', '4px', 'important')
            htmlElement.style.setProperty('font-size', '14px', 'important')
            htmlElement.style.setProperty('font-weight', '500', 'important')
            htmlElement.style.setProperty('cursor', 'pointer', 'important')
            htmlElement.style.setProperty('text-decoration', 'none', 'important')
            htmlElement.style.setProperty('display', 'inline-block', 'important')
            htmlElement.style.setProperty('visibility', 'visible', 'important')
            htmlElement.style.setProperty('opacity', '1', 'important')
          })
          
          // Fix all select elements
          const selects = qrReader.querySelectorAll('select')
          selects.forEach((select) => {
            select.style.setProperty('background', 'white', 'important')
            select.style.setProperty('color', '#1f2937', 'important')
            select.style.setProperty('border', '1px solid #d1d5db', 'important')
          })
          
          // Fix all text elements to be visible (except buttons)
          const textElements = qrReader.querySelectorAll('span:not(button span), div:not(button div)')
          textElements.forEach((element) => {
            const htmlElement = element as HTMLElement
            // Only set color if not inside a button
            if (!htmlElement.closest('button')) {
              htmlElement.style.setProperty('color', '#1f2937', 'important')
            }
          })
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isScanning])

  const startScanner = () => {
    setIsScanning(true)
    setScanResult(null)
    setCameraError(null)
  }

  const stopScanner = () => {
    setIsScanning(false)
  }

  const onScanSuccess = async (decodedText: string) => {
    setIsScanning(false)
    setIsProcessing(true)

    try {
      // Parse the QR code data
      let qrData
      try {
        qrData = JSON.parse(decodedText)
      } catch (parseError) {
        setScanResult({
          success: false,
          message: "Invalid QR code format"
        })
        return
      }

      const { ticketNumber, transactionId } = qrData

      if (!ticketNumber || !transactionId) {
        setScanResult({
          success: false,
          message: "Invalid QR code format"
        })
        return
      }

      // Call the API to validate/use the ticket
      const response = await fetch(`/api/tickets/use/${transactionId}/${ticketNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setScanResult({
          success: true,
          message: "Ticket Accepted",
          transaction: data.transaction
        })
      } else {
        setScanResult({
          success: false,
          message: data.error || "Ticket Invalid"
        })
      }
    } catch (error) {
      console.error('Error processing ticket:', error)
      setScanResult({
        success: false,
        message: "Error processing ticket"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const onScanError = (error: any) => {
    // Ignore errors during scanning - they're normal
    console.log('Scan error:', error)
    
    // Check for specific mobile camera errors
    if (error && error.toString && error.toString().includes('toString')) {
      console.error('Mobile camera error detected:', error)
      setCameraError('Camera access error. Please refresh and try again.')
      setIsScanning(false)
    }
  }

  const handleScanAgain = () => {
    setScanResult(null)
    setCameraError(null)
    startScanner()
  }

  const handleBackToDashboard = () => {
    window.location.href = '/admin/dashboard'
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-white">Loading...</span>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Minimal CSS for html5-qrcode library */}
      <style jsx>{`
        #qr-reader {
          background: #f8f9fa !important;
          border-radius: 8px !important;
          padding: 20px !important;
          margin: 0 auto !important;
          max-width: 400px !important;
        }
        
        /* Let the library handle its own buttons and styling */
        #qr-reader button {
          background: #3b82f6 !important;
          color: white !important;
          border: 1px solid #2563eb !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          margin: 8px 4px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          min-height: 36px !important;
        }
        
        #qr-reader button:hover {
          background: #2563eb !important;
          border-color: #1d4ed8 !important;
        }
        
        /* Ensure all clickable elements are visible */
        #qr-reader a,
        #qr-reader span[onclick],
        #qr-reader div[onclick],
        #qr-reader *[role="button"] {
          background: #3b82f6 !important;
          color: white !important;
          border: 1px solid #2563eb !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          margin: 4px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          text-decoration: none !important;
          display: inline-block !important;
        }
        
        #qr-reader select {
          margin: 8px 0 !important;
          padding: 4px 8px !important;
          font-size: 14px !important;
          background: white !important;
          color: #1f2937 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 4px !important;
        }
        
        /* Ensure all text elements inside qr-reader are visible */
        #qr-reader * {
          color: #1f2937 !important;
        }
        
        /* Override button colors specifically */
        #qr-reader button,
        #qr-reader a,
        #qr-reader span[onclick],
        #qr-reader div[onclick],
        #qr-reader *[role="button"] {
          color: white !important;
        }
        
        /* Clean video styling */
        #qr-reader video {
          border-radius: 6px !important;
          max-width: 100% !important;
        }
        
        /* Simple text styling */
        #qr-reader span,
        #qr-reader div {
          font-size: 14px !important;
          line-height: 1.4 !important;
          color: #1f2937 !important;
        }
        
        /* Specifically target the camera selection text */
        #qr-reader select + span,
        #qr-reader select ~ span,
        #qr-reader select ~ div {
          color: #1f2937 !important;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Ticket Scanner</h1>
            <p className="text-gray-400">Scan QR codes to validate tickets</p>
          </div>
          <Button 
            onClick={handleBackToDashboard}
            variant="outline" 
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Scanner Section */}
          {!scanResult && !isScanning && (
            <div className="text-center space-y-6">
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Ready to Scan
                </h2>
                <p className="text-gray-400 mb-6">
                  Click the button below to start scanning QR codes on tickets
                </p>
                <Button 
                  onClick={startScanner}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                >
                  Start Scanner
                </Button>
              </div>
            </div>
          )}

          {/* Scanner Active */}
          {isScanning && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Scanning QR Code
                </h2>
                <p className="text-gray-400">
                  Point the camera at the ticket's QR code
                </p>
              </div>
              
              {/* Camera Error Display */}
              {cameraError && (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 text-center">
                  <p className="text-red-400 mb-2">{cameraError}</p>
                  <Button 
                    onClick={handleScanAgain}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              
              <div 
                key={isScanning ? 'scanning' : 'not-scanning'}
                id="qr-reader" 
                className="w-full max-w-md mx-auto"
              ></div>
              <div className="text-center">
                <Button 
                  onClick={stopScanner}
                  variant="outline"
                  className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="text-center space-y-6">
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
                <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h2 className="text-xl font-semibold text-white mb-2">
                  Processing Ticket
                </h2>
                <p className="text-gray-400">
                  Validating ticket information...
                </p>
              </div>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div className="text-center space-y-6">
              <div className={`rounded-lg p-8 border ${
                scanResult.success 
                  ? 'bg-green-900/20 border-green-600' 
                  : 'bg-red-900/20 border-red-600'
              }`}>
                {scanResult.success ? (
                  <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
                )}
                
                <h2 className={`text-3xl font-bold mb-2 ${
                  scanResult.success ? 'text-green-500' : 'text-red-500'
                }`}>
                  {scanResult.message}
                </h2>
                
                <p className="text-gray-400 mb-6">
                  {scanResult.success 
                    ? "Ticket has been successfully validated and marked as used."
                    : "This ticket cannot be used. Please check with the customer."
                  }
                </p>

                <div className="flex flex-col gap-4 justify-center">
                  <Button 
                    onClick={handleScanAgain}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Scan Again
                  </Button>
                  <Button 
                    onClick={handleBackToDashboard}
                    variant="outline"
                    size="lg"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 