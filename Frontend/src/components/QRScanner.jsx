import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import { FaCamera, FaTimes, FaQrcode } from 'react-icons/fa';
import '../styles/QRScanner.css';

const QRScanner = ({ onScanSuccess, onClose, isOpen }) => {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState('');
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      
      // Start continuous scanning
      const videoElement = webcamRef.current?.video;
      if (videoElement) {
        await codeReader.current.decodeFromVideoDevice(
          undefined,
          videoElement,
          (result, error) => {
            if (result) {
              const scannedText = result.getText();
              setScanResult(scannedText);
              handleScanResult(scannedText);
            }
            if (error && error.name !== 'NotFoundException') {
              console.warn('QR Scan Error:', error);
            }
          }
        );
      }
    } catch (err) {
      setError('Failed to start camera. Please check permissions.');
      console.error('Scanner error:', err);
    }
  };

  const stopScanning = () => {
    try {
      codeReader.current.reset();
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  const handleScanResult = (data) => {
    try {
      // Try to parse as JSON for quest data
      const questData = JSON.parse(data);
      if (questData.type === 'jumbah_quest' && questData.questId) {
        onScanSuccess(questData);
        stopScanning();
      } else {
        setError('Invalid QR code. Please scan a JumBah quest QR code.');
      }
    } catch (err) {
      // If not JSON, treat as simple quest ID
      if (data.startsWith('JUMBAH_')) {
        onScanSuccess({ type: 'jumbah_quest', questId: data });
        stopScanning();
      } else {
        setError('Invalid QR code format. Please scan a valid JumBah quest QR code.');
      }
    }
  };

  const handleManualInput = () => {
    const input = prompt('Enter quest code manually:');
    if (input) {
      handleScanResult(input);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h3>
            <FaQrcode /> Scan Quest QR Code
          </h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="qr-scanner-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="camera-container">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 300,
                height: 300,
                facingMode: 'environment'
              }}
              className="webcam-video"
            />
            <div className="scan-overlay">
              <div className="scan-frame"></div>
            </div>
          </div>

          {scanResult && (
            <div className="scan-result">
              <p>Scanned: {scanResult}</p>
            </div>
          )}

          <div className="scanner-controls">
            <button 
              className="manual-input-btn"
              onClick={handleManualInput}
            >
              Enter Code Manually
            </button>
            <button 
              className="retry-btn"
              onClick={() => {
                setError('');
                setScanResult('');
                startScanning();
              }}
            >
              <FaCamera /> Retry Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;