import { useState } from 'react'; // [PHOTOS DISABLED] useRef
import { KBO_STADIUMS, COMPANION_OPTIONS } from '../../data/mockData';
import SeatMapModal from './SeatMapModal';
import './RecordForm.css';

// [PHOTOS DISABLED] const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 승/패/무 자동 계산 — 원정팀·홈팀·구장·점수·응원팀이 모두 채워져야만 발동 (기준: 응원팀)
function computeResult({ score_home, score_away, my_team, home_team, away_team, stadium }) {
  // 필수 항목이 하나라도 비면 자동 판정 안 함
  if (!away_team || !home_team || !stadium || !my_team) return null;
  if (score_home === '' || score_away === '') return null;
  const h = Number(score_home), a = Number(score_away);
  if (Number.isNaN(h) || Number.isNaN(a)) return null;
  // 응원팀이 그 경기의 두 팀 중 하나가 아니면 판정 불가
  let mine, opp;
  if (my_team === home_team) { mine = h; opp = a; }
  else if (my_team === away_team) { mine = a; opp = h; }
  else return null;
  if (mine > opp) return '승';
  if (mine < opp) return '패';
  return '무';
}

export default function RecordForm({ teams = [], initialValues = {}, initialPhotos = [], isEdit = false, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    date: initialValues.date ?? new Date().toISOString().slice(0, 10),
    home_team: initialValues.home_team ?? '',
    away_team: initialValues.away_team ?? '',
    stadium: initialValues.stadium ?? '',
    my_team: initialValues.my_team ?? localStorage.getItem('myTeam') ?? '',
    result: initialValues.result ?? '',
    score_home: initialValues.score_home != null ? String(initialValues.score_home) : '',
    score_away: initialValues.score_away != null ? String(initialValues.score_away) : '',
    comment: initialValues.comment ?? '',
    memo: initialValues.memo ?? '',
    food: initialValues.food ?? '',
    weather: initialValues.weather ?? [],
    seat: initialValues.seat ?? '',
    companion: initialValues.companion ?? '',
  });
  const [seatDetail, setSeatDetail] = useState('');
  const [seatStep, setSeatStep] = useState({ base: '', sub: '' });
  const [seatMapOpen, setSeatMapOpen] = useState(false);
  // [PHOTOS DISABLED]
  // const [existingPhotos, setExistingPhotos] = useState(initialPhotos);
  // const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  // const [photos, setPhotos] = useState([]);
  // const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // [PHOTOS DISABLED] const dropRef = useRef(null);

  // [PHOTOS DISABLED] const totalPhotoCount = existingPhotos.length + photos.length;

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'home_team') {
        const team = teams.find(t => t.id === value);
        if (team?.stadiums?.[0]) next.stadium = team.stadiums[0];
        next.seat = '';
      }
      if (field === 'stadium') next.seat = '';
      // 필수 항목(원정팀·홈팀·구장·점수·응원팀)이 모두 채워지면 승/패/무 자동 갱신
      if (['score_home', 'score_away', 'my_team', 'home_team', 'away_team', 'stadium'].includes(field)) {
        const auto = computeResult(next);
        if (auto) next.result = auto;
      }
      return next;
    });
    if (field === 'home_team' || field === 'stadium') setSeatStep({ base: '', sub: '' });
  }

  // 점수 입력: 숫자만, 최대 2자리
  function setScore(field, raw) {
    set(field, raw.replace(/[^0-9]/g, '').slice(0, 2));
  }

  const autoResult = computeResult(form);

  // [PHOTOS DISABLED]
  // function addFiles(files) {
  //   const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
  //   if (totalPhotoCount + arr.length > 3) { alert('사진은 최대 3장까지 업로드 가능합니다.'); return; }
  //   setPhotos(prev => [...prev, ...arr]);
  // }

  // function removeExistingPhoto(photoId) {
  //   setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
  //   setDeletedPhotoIds(prev => [...prev, photoId]);
  // }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.home_team || !form.away_team || !form.result) {
      alert('홈팀, 원정팀, 경기 결과는 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const submitData = {
        ...form,
        weather: form.weather.join(' '),
        score_home: form.score_home === '' ? null : Number(form.score_home),
        score_away: form.score_away === '' ? null : Number(form.score_away),
      };
      if (seatDetail) submitData.seat = form.seat ? `${form.seat} ${seatDetail}` : seatDetail;
      await onSubmit(submitData, [], []); // [PHOTOS DISABLED] was: (submitData, photos, deletedPhotoIds)
    } catch {
      alert('저장 중 오류가 발생했습니다. 백엔드가 실행 중인지 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rf-form">
      {/* 경기 날짜 */}
      <div className="rf-field">
        <label className="rf-label">경기 날짜</label>
        <input
          className="rf-input"
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          required
        />
      </div>

      {/* 팀 */}
      <div className="rf-row">
        <div className="rf-field">
          <label className="rf-label">원정팀 <span className="rf-required">*</span></label>
          <div className="rf-select-wrap">
            <select className="rf-select" value={form.away_team} onChange={e => set('away_team', e.target.value)} required>
              <option value="">선택</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name || t.id}</option>)}
            </select>
          </div>
        </div>
        <div className="rf-field">
          <label className="rf-label">홈팀 <span className="rf-required">*</span></label>
          <div className="rf-select-wrap">
            <select className="rf-select" value={form.home_team} onChange={e => set('home_team', e.target.value)} required>
              <option value="">선택</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name || t.id}</option>)}
            </select>
          </div>
        </div>
        <div className="rf-field">
          <label className="rf-label">
            응원팀
            <span className="rf-tooltip-wrap">
              <span className="rf-tooltip-icon">?</span>
              <span className="rf-tooltip-box">기본값은 처음 설정한 내 팀이에요.<br />이번 직관에서 응원한 팀으로 바꿀 수 있어요.</span>
            </span>
          </label>
          <div className="rf-select-wrap">
            <select className="rf-select" value={form.my_team} onChange={e => set('my_team', e.target.value)}>
              <option value="">선택</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name || t.id}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 구장 & 날씨 */}
      <div className="rf-row rf-row-2">
        <div className="rf-field">
          <label className="rf-label">구장</label>
          <div className="rf-select-wrap">
            <select className="rf-select" value={form.stadium} onChange={e => set('stadium', e.target.value)}>
              <option value="">선택</option>
              {KBO_STADIUMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="rf-field">
          <label className="rf-label">날씨</label>
          <div className="rf-weather-group">
            {[
              { v: '☀️', label: '맑음' },
              { v: '⛅', label: '흐림' },
              { v: '🌬️', label: '바람' },
              { v: '🌧️', label: '비' },
              { v: '❄️', label: '눈' },
            ].map(w => (
              <button
                key={w.v}
                type="button"
                title={w.label}
                className={`rf-weather-btn${form.weather.includes(w.v) ? ' selected' : ''}`}
                onClick={() => set('weather', form.weather.includes(w.v)
                  ? form.weather.filter(x => x !== w.v)
                  : [...form.weather, w.v]
                )}
              >
                {w.v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 경기 결과 */}
      <div className="rf-field">
        <label className="rf-label">경기 결과 <span className="rf-required">*</span></label>

        <div className="rf-result-row">
          {/* 점수 입력 (원정 : 홈) */}
          <div className="rf-score-box">
            <input
              className="rf-score-input"
              type="text"
              inputMode="numeric"
              value={form.score_away}
              onChange={e => setScore('score_away', e.target.value)}
              placeholder="원정"
              aria-label="원정팀 점수"
            />
            <span className="rf-score-colon">:</span>
            <input
              className="rf-score-input"
              type="text"
              inputMode="numeric"
              value={form.score_home}
              onChange={e => setScore('score_home', e.target.value)}
              placeholder="홈"
              aria-label="홈팀 점수"
            />
          </div>

          <div className="rf-result-group">
          {[
            { v: '승', icon: '😊', cls: 'win' },
            { v: '패', icon: '😔', cls: 'loss' },
            { v: '무', icon: '😐', cls: 'draw' },
          ].map(r => (
            <button
              key={r.v}
              type="button"
              className={`rf-result-btn ${form.result === r.v ? 'selected ' + r.cls : ''}`}
              onClick={() => set('result', r.v)}
            >
              <span className="rf-result-icon">{r.icon}</span>
              <span>{r.v}</span>
            </button>
          ))}
          </div>
        </div>
        {autoResult && (
          <p className="rf-score-hint">
            응원팀 <strong>{form.my_team}</strong> 기준 자동 결과: <strong>{autoResult}</strong>
            {' '}(직접 바꿀 수 있어요)
          </p>
        )}
      </div>

      {/* 좌석 & 동행 */}
      <div className="rf-row rf-row-seat">
        <div className="rf-field">
          <label className="rf-label">좌석</label>
          <div className="rf-seat-wrap">
            {form.stadium === '잠실야구장' ? (
              <>
                <button
                  type="button"
                  className={`rf-seat-map-btn${form.seat ? ' selected' : ''}`}
                  onClick={() => setSeatMapOpen(true)}
                >
                  {form.seat ? `📍 ${form.seat}` : '🗺 좌석표에서 선택'}
                </button>
                {form.seat && (
                  <button type="button" className="rf-seat-clear-btn" onClick={() => set('seat', '')}>×</button>
                )}
              </>
            ) : (
              <>
                <div className="rf-select-wrap rf-seat-base-select">
                  <select
                    className="rf-select"
                    value={seatStep.base}
                    onChange={e => {
                      const base = e.target.value;
                      setSeatStep(prev => ({ ...prev, base }));
                      set('seat', base && seatStep.sub ? `${base} ${seatStep.sub}` : '');
                    }}
                  >
                    <option value="">구역</option>
                    <option value="1루">1루</option>
                    <option value="3루">3루</option>
                  </select>
                </div>
                <div className="rf-select-wrap rf-seat-sub-select">
                  <select
                    className="rf-select"
                    value={seatStep.sub}
                    onChange={e => {
                      const sub = e.target.value;
                      setSeatStep(prev => ({ ...prev, sub }));
                      set('seat', seatStep.base && sub ? `${seatStep.base} ${sub}` : '');
                    }}
                  >
                    <option value="">내/외야</option>
                    <option value="내야">내야</option>
                    <option value="외야">외야</option>
                  </select>
                </div>
              </>
            )}
            <input
              className="rf-input rf-seat-detail"
              type="text"
              value={seatDetail}
              onChange={e => setSeatDetail(e.target.value)}
              placeholder={form.stadium === '잠실야구장' ? '예: 16열 13,14' : '예: 306구역 16열 13,14'}
              maxLength={20}
            />
          </div>
        </div>
        <div className="rf-field">
          <label className="rf-label">동행</label>
          <div className="rf-select-wrap">
            <select className="rf-select" value={form.companion} onChange={e => set('companion', e.target.value)}>
              <option value="">-</option>
              {COMPANION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 한줄평 */}
      <div className="rf-field">
        <label className="rf-label">
          한줄평
          <span className="rf-charcount">{form.comment.length}/100</span>
        </label>
        <textarea
          className="rf-textarea"
          value={form.comment}
          onChange={e => set('comment', e.target.value.slice(0, 100))}
          placeholder="오늘 직관은 어땠나요? 😊"
          rows={2}
        />
      </div>

      {/* 메모 */}
      <div className="rf-field">
        <label className="rf-label">메모</label>
        <textarea
          className="rf-textarea"
          value={form.memo}
          onChange={e => set('memo', e.target.value)}
          placeholder="자세한 기억, 특별한 순간, 남기고 싶은 이야기..."
          rows={3}
        />
      </div>

      {/* 먹은 음식 */}
      <div className="rf-field">
        <label className="rf-label">먹은 음식</label>
        <input
          className="rf-input"
          type="text"
          value={form.food}
          onChange={e => set('food', e.target.value)}
          placeholder="치킨, 맥주, 핫도그..."
        />
      </div>

      {/* [PHOTOS DISABLED]
      <div className="rf-field">
        <label className="rf-label">사진 업로드 (최대 3장)</label>
        <div
          ref={dropRef}
          className={`rf-photo-area${dragOver ? ' drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        >
          {existingPhotos.map(p => (
            <div key={p.id} className="rf-photo-preview">
              <img src={`${API_BASE}${p.file_path}`} alt="" />
              <button type="button" className="rf-photo-remove" onClick={() => removeExistingPhoto(p.id)}>×</button>
            </div>
          ))}
          {photos.map((p, i) => (
            <div key={`new-${i}`} className="rf-photo-preview">
              <img src={URL.createObjectURL(p)} alt="" />
              <button type="button" className="rf-photo-remove" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
          {totalPhotoCount < 3 && (
            <label className="rf-photo-add">
              <span className="rf-photo-add-icon">📷</span>
              <span className="rf-photo-add-text">추가하기</span>
              <input type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
            </label>
          )}
          {totalPhotoCount === 0 && <p className="rf-photo-hint">드래그 앤 드롭 또는 클릭하여 사진 추가</p>}
        </div>
      </div>
      */}

      <SeatMapModal
        open={seatMapOpen}
        onSelect={zone => set('seat', zone)}
        onClose={() => setSeatMapOpen(false)}
      />

      {/* 버튼 */}
      <div className="rf-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>취소</button>
        <button type="submit" className="btn-primary rf-submit" disabled={submitting}>
          {submitting ? '저장 중...' : isEdit ? '수정 완료' : '저장하기'}
        </button>
      </div>
    </form>
  );
}
