import React, { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

/**
 * QRScanner
 * Uses html5-qrcode (works on https and localhost). 
 * Props: onScan(code), onError(err)
 */
export default function QRScanner({ onScan, onError }) {
  const ref = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true }
    const verbose = false
    const scanner = new Html5QrcodeScanner(ref.current.id, config, verbose)
    scannerRef.current = scanner

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {})
        onScan && onScan(decodedText)
      },
      (err) => {
        // Soft errors during scanning are frequent; avoid spamming.
        onError && console.debug(err)
      }
    )

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [])

  return <div id="qr-reader" ref={ref} className="qr-box" />
}
