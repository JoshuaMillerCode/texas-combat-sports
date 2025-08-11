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
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
            defaultZoomValueIfSupported: 2,
          },
          false
        )

        try {
          scanner.render(onScanSuccess, onScanError)
          scannerRef.current = scanner
        } catch (error) {
          console.error('Error initializing scanner:', error)
          setIsScanning(false)
        }
      }, 100)

      return () => clearTimeout(timer)
    } else {
      // Clean up scanner when not scanning
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [isScanning])

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  const startScanner = () => {
    setIsScanning(true)
    setScanResult(null)
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
  }

  const handleScanAgain = () => {
    setScanResult(null)
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
      {/* Custom CSS for html5-qrcode library */}
      <style jsx>{`
        #qr-reader {
          background: white !important;
          border-radius: 8px !important;
          padding: 16px !important;
        }
        
        #qr-reader * {
          color: black !important;
        }
        
        #qr-reader button {
          background: #3b82f6 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 4px !important;
          margin: 4px !important;
        }
        
        #qr-reader button:hover {
          background: #2563eb !important;
        }
        
        #qr-reader select {
          background: white !important;
          color: black !important;
          border: 1px solid #d1d5db !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }
        
        #qr-reader__scan_region {
          background: white !important;
        }
        
        #qr-reader__scan_region video {
          border-radius: 4px !important;
        }
        
        #qr-reader__dashboard {
          background: white !important;
          color: black !important;
        }
        
        #qr-reader__dashboard_section {
          background: white !important;
          color: black !important;
        }
        
        #qr-reader__dashboard_section_swaplink {
          color: #3b82f6 !important;
        }
        
        #qr-reader__dashboard_section_swaplink:hover {
          color: #2563eb !important;
        }
        
        #qr-reader__status_span {
          color: black !important;
        }
        
        #qr-reader__camera_selection {
          background: white !important;
          color: black !important;
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
              <div 
                key={isScanning ? 'scanning' : 'not-scanning'}
                id="qr-reader" 
                className="w-full max-w-md mx-auto"
              ></div>
              <div className="text-center">
                <Button 
                  onClick={stopScanner}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel Scan
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