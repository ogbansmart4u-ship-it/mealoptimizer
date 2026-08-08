import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Camera, Info, Clock, Trash2 } from 'lucide-react';
import { projectId } from '/utils/supabase/info';
import CameraCapture from '../components/CameraCapture';
import PageHeader from '../components/PageHeader';
import MascotLoader from '../components/MascotLoader';
import { getAccessToken } from '../../lib/supabase';

interface ScanHistoryItem {
  barcode: string;
  productName: string;
  brand?: string;
  timestamp: string;
  calories?: number;
}

export default function ScanBarcode() {
  const navigate = useNavigate();
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [barcodeData, setBarcodeData] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  // Load scan history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('barcode-scan-history');
    if (saved) {
      setScanHistory(JSON.parse(saved));
    }
  }, []);

  // Save scan history to localStorage
  const saveScanHistory = (history: ScanHistoryItem[]) => {
    localStorage.setItem('barcode-scan-history', JSON.stringify(history));
    setScanHistory(history);
  };

  const addToHistory = (barcode: string, product: any) => {
    const newItem: ScanHistoryItem = {
      barcode,
      productName: product.name || 'Unknown Product',
      brand: product.brand,
      timestamp: new Date().toISOString(),
      calories: product.calories,
    };

    // Add to beginning, keep last 10
    const updatedHistory = [newItem, ...scanHistory.filter(item => item.barcode !== barcode)].slice(0, 10);
    saveScanHistory(updatedHistory);
  };

  const clearHistory = () => {
    if (confirm('Clear all scan history?')) {
      saveScanHistory([]);
    }
  };

  const loadFromHistory = (item: ScanHistoryItem) => {
    setBarcodeData(item.barcode);
    fetchProductInfo(item.barcode);
  };

  const handleCameraCapture = async (
    imageData: string,
    source: 'camera' | 'upload' | 'manual',
    manualInput?: string
  ) => {
    setLoading(true);
    setError(null);
    setBarcodeData(null);
    setProductInfo(null);

    try {
      if (source === 'manual' && manualInput) {
        // User entered barcode manually
        setBarcodeData(manualInput);
        await fetchProductInfo(manualInput);
      } else if (imageData) {
        // Image from camera or upload
        // For now, we'll simulate barcode detection
        // In production, you would use a barcode detection library or API
        const mockBarcode = '5000112576009'; // Example: Heinz Tomato Ketchup
        setBarcodeData(mockBarcode);
        await fetchProductInfo(mockBarcode);
      }
    } catch (err) {
      console.error('Error processing barcode:', err);
      setError('Failed to process barcode. Please try again.');
      setLoading(false);
    }
  };

  const fetchProductInfo = async (barcode: string) => {
    try {
      setLoading(true);

      // Get the access token
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/barcode/${barcode}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product info: ${response.status}`);
      }

      const data = await response.json();
      setProductInfo(data.product);

      // Add to scan history
      if (data.product) {
        addToHistory(barcode, data.product);
      }
    } catch (err) {
      console.error('Error fetching product info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4]">
      {/* Header */}
      <PageHeader
        title="Scan Barcode"
        showHome
        className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f]"
      />

      {/* Content */}
      <div className="p-6">
        {/* Info Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 text-white">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-1 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Scan product barcodes to get nutritional information</p>
              <p className="text-white/80">Take a photo of a product barcode or enter it manually to view nutrition facts and health insights.</p>
            </div>
          </div>
        </div>

        {/* Scan Options */}
        {!barcodeData && !loading && (
          <div className="space-y-4">
            {/* Camera/Upload Button */}
            <button
              onClick={() => setShowCameraCapture(true)}
              className="w-full bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center gap-4 border-2 border-[#2a9d8f] hover:scale-105 group"
            >
              <div className="bg-gradient-to-br from-[#2a9d8f] to-[#4ecdc4] rounded-full p-6">
                <Camera className="h-12 w-12 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#1f7a8c] mb-1">Scan Barcode</h3>
                <p className="text-sm text-gray-600">
                  Camera, upload, or enter manually
                </p>
              </div>
            </button>

            {/* Recent Scans */}
            {scanHistory.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-white" />
                    <h3 className="text-white font-semibold">Recent Scans</h3>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="p-2 hover:bg-white/10 rounded-full transition"
                    title="Clear history"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scanHistory.map((item, index) => (
                    <button
                      key={`${item.barcode}-${index}`}
                      onClick={() => loadFromHistory(item)}
                      className="w-full bg-white rounded-xl p-3 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                          {item.brand && (
                            <p className="text-xs text-gray-600 mt-1">{item.brand}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleDateString()} • {item.barcode}
                          </p>
                        </div>
                        {item.calories && (
                          <div className="ml-3 text-right">
                            <p className="text-sm font-semibold text-[#1f7a8c]">{item.calories}</p>
                            <p className="text-xs text-gray-500">cal</p>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Capture Modal */}
        <CameraCapture
          isOpen={showCameraCapture}
          onClose={() => setShowCameraCapture(false)}
          onCapture={handleCameraCapture}
          mode="barcode"
          title="Scan Product Barcode"
        />

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <MascotLoader label="Analyzing barcode..." size={84} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setBarcodeData(null);
                setProductInfo(null);
              }}
              className="px-6 py-2 bg-white text-[#1f7a8c] rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Product Info Display */}
        {productInfo && !loading && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Product Header */}
            <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] p-6 text-white">
              <p className="text-sm opacity-80 mb-1">Barcode: {barcodeData}</p>
              <h2 className="text-2xl font-bold">{productInfo.name}</h2>
              {productInfo.brand && (
                <p className="text-lg opacity-90 mt-1">{productInfo.brand}</p>
              )}
              {productInfo.source && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-white/20">
                  {productInfo.source === 'openfoodfacts'
                    ? '✓ Verified product data'
                    : productInfo.source === 'ai_estimate'
                    ? 'AI estimate — verify the label'
                    : productInfo.source === 'not_found'
                    ? 'Not found in database'
                    : ''}
                </span>
              )}
              {productInfo.per && (
                <span className="block text-xs opacity-80 mt-1">Nutrition {productInfo.per}</span>
              )}
            </div>

            {/* Nutrition Facts */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-[#1f7a8c] mb-4">Nutrition Facts</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Calories</span>
                  <span className="font-semibold text-[#1f7a8c]">{productInfo.calories || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Protein</span>
                  <span className="font-semibold text-[#1f7a8c]">{productInfo.protein || 'N/A'}g</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Carbohydrates</span>
                  <span className="font-semibold text-[#1f7a8c]">{productInfo.carbs || 'N/A'}g</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-700">Fats</span>
                  <span className="font-semibold text-[#1f7a8c]">{productInfo.fats || 'N/A'}g</span>
                </div>
                {productInfo.fiber && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-700">Fiber</span>
                    <span className="font-semibold text-[#1f7a8c]">{productInfo.fiber}g</span>
                  </div>
                )}
              </div>

              {/* Health Insights */}
              {productInfo.healthInsights && (
                <div className="mt-6 bg-[#F0F9FA] rounded-xl p-4">
                  <h4 className="font-semibold text-[#1f7a8c] mb-2">Health Insights</h4>
                  <p className="text-sm text-gray-700">{productInfo.healthInsights}</p>
                </div>
              )}

              {/* Ingredients */}
              {productInfo.ingredients && (
                <div className="mt-6">
                  <h4 className="font-semibold text-[#1f7a8c] mb-2">Ingredients</h4>
                  <p className="text-sm text-gray-700">{productInfo.ingredients}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setBarcodeData(null);
                    setProductInfo(null);
                    setError(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Scan Another Product
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full border-2 border-[#1f7a8c] text-[#1f7a8c] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
