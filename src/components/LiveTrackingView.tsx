import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Battery,
  Gauge,
  Clock,
  Radio,
  Phone,
  Compass,
  RefreshCw,
  X,
  Crosshair,
} from 'lucide-react';
import { TrackingEmployee } from '../types';
import { GOOGLE_MAPS_API_KEY } from '../config';

interface LiveTrackingViewProps {
  trackingList: TrackingEmployee[];
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  trackingList,
  onRefresh,
  isRefreshing,
}) => {
  const [selectedEmp, setSelectedEmp] = useState<TrackingEmployee | null>(null);
  const [mapLayerType, setMapLayerType] = useState<'google' | 'osm' | 'satellite'>('google');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const empMarkerRef = useRef<L.Marker | null>(null);
  const hqMarkerRef = useRef<L.Marker | null>(null);

  // Auto-refresh interval (every 10 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      onRefresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // Keep selectedEmp updated with fresh telemetry when trackingList updates
  useEffect(() => {
    if (selectedEmp) {
      const updated = trackingList.find((e) => e.employee_id === selectedEmp.employee_id);
      if (updated) setSelectedEmp(updated);
    }
  }, [trackingList]);

  // Manage Leaflet Map inside Modal
  useEffect(() => {
    if (!selectedEmp || !mapContainerRef.current) return;

    const lat = selectedEmp.latitude || 12.9342;
    const lng = selectedEmp.longitude || 77.6101;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer function
      const getTileUrl = (type: string) => {
        if (type === 'google') {
          return `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`;
        } else if (type === 'satellite') {
          return `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`;
        } else {
          return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
      };

      const tileLayer = L.tileLayer(getTileUrl(mapLayerType), {
        attribution: '&copy; Google Maps &copy; OpenStreetMap',
        maxZoom: 20,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Starforce HQ Marker
      const hqIcon = L.divIcon({
        className: 'hq-marker-wrapper',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:30px;height:30px;border-radius:10px;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;border:2px solid #60a5fa;box-shadow:0 4px 12px rgba(37,99,235,0.5);">
              HQ
            </div>
            <div style="font-size:9px;font-weight:700;color:#1e293b;background:#ffffff;padding:1px 5px;border-radius:4px;border:1px solid #cbd5e1;margin-top:2px;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
              Starforce HQ
            </div>
          </div>
        `,
        iconSize: [60, 45],
        iconAnchor: [30, 22],
      });

      hqMarkerRef.current = L.marker([12.9352, 77.6245], { icon: hqIcon })
        .addTo(map)
        .bindPopup('<b>Starforce Headquarters</b><br>Outer Ring Road, Bangalore');

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Update active technician marker
    const markerHtml = `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div style="position:absolute;top:0;width:38px;height:38px;border-radius:50%;background:#10b981;opacity:0.3;animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:relative;display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:14px;background:#ffffff;color:#0f172a;border:2px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-size:12px;font-weight:700;font-family:sans-serif;white-space:nowrap;">
          <span style="width:8px;height:8px;border-radius:50%;background:#10b981;"></span>
          <span>${selectedEmp.name}</span>
        </div>
        <div style="width:2px;height:8px;background:#10b981;margin-top:-1px;"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 6px #10b981;"></div>
      </div>
    `;

    const empIcon = L.divIcon({
      className: `emp-marker-${selectedEmp.employee_id}`,
      html: markerHtml,
      iconSize: [80, 50],
      iconAnchor: [40, 45],
    });

    if (empMarkerRef.current) {
      empMarkerRef.current.setLatLng([lat, lng]);
      empMarkerRef.current.setIcon(empIcon);
    } else {
      empMarkerRef.current = L.marker([lat, lng], { icon: empIcon }).addTo(map);
    }

    map.panTo([lat, lng]);
  }, [selectedEmp, mapLayerType]);

  const handleTileChange = (type: 'google' | 'osm' | 'satellite') => {
    setMapLayerType(type);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const getTileUrl = (t: string) => {
      if (t === 'google') {
        return `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`;
      } else if (t === 'satellite') {
        return `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`;
      } else {
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      }
    };

    const newLayer = L.tileLayer(getTileUrl(type), {
      attribution: '&copy; Google Maps &copy; OpenStreetMap',
      maxZoom: 20,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && selectedEmp) {
      mapInstanceRef.current.setView([selectedEmp.latitude || 12.9342, selectedEmp.longitude || 77.6101], 16);
    }
  };

  const handleCloseModal = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      empMarkerRef.current = null;
      hqMarkerRef.current = null;
    }
    setSelectedEmp(null);
  };

  // Only show true field service technicians & employees, exclude field officers (SF-FO)
  const employeeTrackingList = trackingList.filter((e) => {
    if (e.employee_code && e.employee_code.startsWith('SF-FO')) return false;
    if (e.designation && e.designation.toLowerCase().includes('field operations officer')) return false;
    return true;
  });

  const activeOnDutyCount = employeeTrackingList.filter((e) => e.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Top Controls & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Field Workforce Live Telemetry</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activeOnDutyCount} Active On-Duty
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live GPS location streaming during active shifts • Click &ldquo;Track on Map&rdquo; to view real-time radar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Auto Live Sync Switch */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              autoRefresh
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="Toggle live telemetry streaming every 10s"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
            <span>{autoRefresh ? 'Live Sync Active (10s)' : 'Sync Paused'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync GPS</span>
          </button>
        </div>
      </div>

      {/* Main Tabular View: All Details of Field Staff on Duty */}
      <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-4 px-6">Field Technician</th>
                <th className="py-4 px-6">Department & Role</th>
                <th className="py-4 px-6">Shift Telemetry Status</th>
                <th className="py-4 px-6">GPS Coordinates</th>
                <th className="py-4 px-6">Battery & Transit</th>
                <th className="py-4 px-6 text-right">Map Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employeeTrackingList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <Radio className="w-6 h-6" />
                      </div>
                      <div className="text-slate-800 font-semibold">No Active Field Employees on Telemetry</div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Field technicians and employees will appear here automatically when on active duty shifts. Field officers are monitored under the dedicated &ldquo;Field Officers &amp; Referrals&rdquo; portal.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                employeeTrackingList.map((emp) => {
                  const isOnline = emp.status === 'online';
                  const mins = emp.minutes_ago !== null && emp.minutes_ago !== undefined ? Math.round(emp.minutes_ago) : null;
                  const pingText = !isOnline ? 'Off Duty' : mins === null ? 'Just now' : mins === 0 ? 'Just now' : `${mins}m ago`;

                  return (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Technician Profile */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold flex items-center justify-center text-sm shadow-sm">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              <span>{emp.name}</span>
                              <span className="text-[10px] font-mono text-indigo-600 font-bold px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                                {emp.employee_code}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{emp.phone || '+91 98450 12345'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-4 px-6">
                        <div className="text-xs text-slate-900 font-semibold">{emp.designation}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{emp.department}</div>
                      </td>

                      {/* Shift Telemetry Status */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${
                              isOnline
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            ></span>
                            <span>{isOnline ? 'Live Active' : 'Unavailable'}</span>
                          </span>

                          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{pingText}</span>
                          </span>
                        </div>
                      </td>

                      {/* GPS Coordinates */}
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>
                            {emp.latitude?.toFixed(4)}°N, {emp.longitude?.toFixed(4)}°E
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-cyan-600" />
                          <span>Accuracy ±{emp.accuracy || 12}m</span>
                        </div>
                      </td>

                      {/* Battery & Transit */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Battery
                              className={`w-4 h-4 ${
                                emp.battery_level > 60
                                  ? 'text-emerald-600'
                                  : emp.battery_level > 20
                                  ? 'text-amber-500'
                                  : 'text-rose-500'
                              }`}
                            />
                            <span className="text-xs font-semibold text-slate-900 font-mono">{emp.battery_level}%</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                            <Gauge className="w-3.5 h-3.5 text-amber-500" />
                            <span>{emp.speed > 0 ? `${(emp.speed * 3.6).toFixed(1)} km/h` : 'Stationary'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Action: Open Map */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedEmp(emp)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Track on Map</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dedicated Interactive Map Modal for Selected Employee */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 bg-white flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold flex items-center justify-center text-sm shadow-sm">
                  {selectedEmp.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedEmp.name}</h3>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                      {selectedEmp.employee_code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>LIVE GPS STREAMING</span>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedEmp.designation} • {selectedEmp.department}
                  </div>
                </div>
              </div>

              {/* Top Controls: Tile switcher, Re-center, Close */}
              <div className="flex items-center gap-2">
                {/* Tile Selector */}
                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                  <button
                    onClick={() => handleTileChange('google')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      mapLayerType === 'google' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Google Maps
                  </button>
                  <button
                    onClick={() => handleTileChange('satellite')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      mapLayerType === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => handleTileChange('osm')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      mapLayerType === 'osm' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    OSM
                  </button>
                </div>

                <button
                  onClick={handleRecenter}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
                  title="Center on Technician"
                >
                  <Crosshair className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors ml-2 shadow-sm"
                  title="Close Map"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map Element Mount */}
            <div className="flex-1 w-full relative">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Floating Live Coordinates & Telemetry HUD */}
              <div className="absolute bottom-5 left-5 right-5 z-[500] pointer-events-none">
                <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Coordinates</div>
                      <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                        {selectedEmp.latitude?.toFixed(5)}° N, {selectedEmp.longitude?.toFixed(5)}° E
                      </div>
                    </div>

                    <div className="border-l border-slate-200 pl-6">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Device Battery</div>
                      <div className="text-sm font-bold text-emerald-600 font-mono mt-0.5 flex items-center gap-1.5">
                        <Battery className="w-4 h-4" />
                        <span>{selectedEmp.battery_level}% Charged</span>
                      </div>
                    </div>

                    <div className="border-l border-slate-200 pl-6 hidden sm:block">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Transit Speed</div>
                      <div className="text-sm font-bold text-amber-600 font-mono mt-0.5 flex items-center gap-1.5">
                        <Gauge className="w-4 h-4" />
                        <span>{selectedEmp.speed > 0 ? `${(selectedEmp.speed * 3.6).toFixed(1)} km/h` : 'Stationary'}</span>
                      </div>
                    </div>

                    <div className="border-l border-slate-200 pl-6 hidden md:block">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">GPS Precision</div>
                      <div className="text-sm font-bold text-cyan-600 font-mono mt-0.5 flex items-center gap-1.5">
                        <Compass className="w-4 h-4" />
                        <span>±{selectedEmp.accuracy || 10}m Accuracy</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Auto-syncing every 10s
                    </span>
                    <button
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition-colors shadow-sm"
                      title="Sync Now"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
