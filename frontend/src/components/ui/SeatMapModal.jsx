import { useState } from 'react';
import './SeatMapModal.css';

function arcSector(cx, cy, r1, r2, startDeg, endDeg) {
  const rad = d => (d * Math.PI) / 180;
  const px = (r, d) => (cx + r * Math.sin(rad(d))).toFixed(1);
  const py = (r, d) => (cy - r * Math.cos(rad(d))).toFixed(1);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${px(r2, startDeg)} ${py(r2, startDeg)}`,
    `A ${r2} ${r2} 0 ${large} 1 ${px(r2, endDeg)} ${py(r2, endDeg)}`,
    `L ${px(r1, endDeg)} ${py(r1, endDeg)}`,
    `A ${r1} ${r1} 0 ${large} 0 ${px(r1, startDeg)} ${py(r1, startDeg)}`,
    'Z',
  ].join(' ');
}

const CX = 300, CY = 295;
const Ro = 265, Rm = 198, Ri = 90;

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
}

const ZONES = [
  {
    id: '3루 외야',
    label: '3루 외야',
    fill: '#2e7d32',
    path: arcSector(CX, CY, Rm, Ro, -80, 0),
    tx: 176, ty: 100,
  },
  {
    id: '1루 외야',
    label: '1루 외야',
    fill: '#2e7d32',
    path: arcSector(CX, CY, Rm, Ro, 0, 80),
    tx: 424, ty: 100,
  },
  {
    id: '1루 내야',
    label: '1루 내야',
    fill: '#01579b',
    path: arcSector(CX, CY, Ri, Ro, 80, 165),
    tx: 460, ty: 340,
  },
  {
    id: '3루 내야',
    label: '3루 내야',
    fill: '#01579b',
    path: arcSector(CX, CY, Ri, Ro, 195, 280),
    tx: 140, ty: 340,
  },
  {
    id: '프리미엄석',
    label: '프리미엄석',
    fill: '#b71c1c',
    path: arcSector(CX, CY, Ri, 170, 165, 195),
    tx: 300, ty: 425,
  },
  {
    id: '중앙네이비',
    label: '중앙네이비',
    fill: '#1a237e',
    path: arcSector(CX, CY, 170, Ro, 165, 195),
    tx: 300, ty: 505,
  },
];

const ZONE_SECTIONS = {
  '1루 외야': [
    { label: '오렌지석(응원석)', color: '#e65100', ids: range(401, 408) },
    { label: '외야석', color: '#2e7d32', ids: range(409, 411) },
  ],
  '3루 외야': [
    { label: '외야석', color: '#2e7d32', ids: range(412, 422) },
  ],
  '1루 내야': [
    { label: '레드석', color: '#c62828', ids: [...range(101, 106), ...range(201, 204)] },
    { label: '오렌지석(응원석)', color: '#e65100', ids: range(205, 208) },
    { label: '블루석', color: '#0288d1', ids: [...range(107, 109), ...range(209, 211)] },
    { label: '테이블석', color: '#7b1fa2', ids: ['110', '111', '212', '213'] },
    { label: '네이비석', color: '#1a237e', ids: range(301, 315) },
  ],
  '3루 내야': [
    { label: '레드석', color: '#c62828', ids: [...range(114, 116), ...range(216, 218)] },
    { label: '오렌지석(응원석)', color: '#e65100', ids: range(219, 222) },
    { label: '블루석', color: '#0288d1', ids: [...range(117, 122), ...range(223, 226)] },
    { label: '테이블석', color: '#7b1fa2', ids: ['112', '113', '214', '215'] },
    { label: '네이비석', color: '#1a237e', ids: range(320, 334) },
  ],
  '중앙네이비': [
    { label: '네이비석', color: '#1a237e', ids: range(316, 319) },
  ],
};

export default function SeatMapModal({ open, onSelect, onClose }) {
  const [hovered, setHovered] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  if (!open) return null;

  const handleZoneClick = (zoneId) => {
    if (!ZONE_SECTIONS[zoneId]) {
      onSelect(zoneId);
      handleClose();
    } else {
      setSelectedZone(zoneId);
      setHovered(null);
    }
  };

  const handleBack = () => {
    setSelectedZone(null);
    setHovered(null);
  };

  const handleSubSelect = (sectionId) => {
    onSelect(`${selectedZone} ${sectionId}구역`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedZone(null);
    setHovered(null);
    onClose();
  };

  return (
    <div className="seatmap-backdrop" onClick={handleClose}>
      <div className="seatmap-modal" onClick={e => e.stopPropagation()}>
        <div className="seatmap-header">
          <div className="seatmap-header-left">
            {selectedZone && (
              <button className="seatmap-back" onClick={handleBack} type="button">←</button>
            )}
            <h3 className="seatmap-title">
              {selectedZone ? `⚾ ${selectedZone}` : '⚾ 좌석 구역 선택'}
            </h3>
          </div>
          <button className="seatmap-close" onClick={handleClose} type="button">×</button>
        </div>

        {selectedZone ? (
          <div className="seatmap-section-list">
            {ZONE_SECTIONS[selectedZone]?.map(group => (
              <div key={group.label}>
                <div className="seatmap-group-label" style={{ '--gc': group.color }}>
                  {group.label}
                </div>
                {group.ids.map(id => (
                  <button
                    key={id}
                    className="seatmap-section-item"
                    onClick={() => handleSubSelect(id)}
                    type="button"
                  >
                    <span className="seatmap-section-dot" style={{ background: group.color }} />
                    {id}구역
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="seatmap-subtitle">구역을 클릭하면 선택됩니다</p>
            <div className="seatmap-body">
              <svg viewBox="0 0 600 600" className="seatmap-svg" xmlns="http://www.w3.org/2000/svg">
                <image href="/stadiums/lg.png" x="0" y="0" width="600" height="600" />
                {ZONES.map(z => (
                  <g
                    key={z.id}
                    onClick={() => handleZoneClick(z.id)}
                    onMouseEnter={() => setHovered(z.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d={z.path}
                      fill={z.fill}
                      fillOpacity={hovered === z.id ? 0.68 : 0.38}
                      stroke="rgba(255,255,255,0.65)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={z.tx} y={z.ty}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="white"
                      stroke="rgba(0,0,0,0.75)" strokeWidth="3" paintOrder="stroke"
                      fontSize="13" fontWeight="700"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {z.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="seatmap-footer">
              {hovered
                ? <span className="seatmap-hint-active">{hovered} 구역 선택</span>
                : <span className="seatmap-hint-idle">구역 위에 마우스를 올려보세요</span>
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
