import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRecords } from '../api';
import RecordCard from '../components/ui/RecordCard';
import RecordForm from '../components/ui/RecordForm';
import EmptyState from '../components/common/EmptyState';
import { MOCK_RECORDS, KBO_TEAMS } from '../data/mockData';
import { createRecord, uploadPhotos } from '../api';
import './Home.css';

function QuickWriteCard({ teams, onSaved }) {
  const [open, setOpen] = useState(true);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(submitData, photos, _deletedIds) {
    const res = await createRecord(submitData);
    const recordId = res.data.id;
    if (photos.length > 0) {
      const fd = new FormData();
      photos.forEach(p => fd.append('photos', p));
      await uploadPhotos(recordId, fd);
    }
    setFormKey(k => k + 1);
    onSaved?.();
  }

  return (
    <div className="qw-card card">
      <div className="qw-header" onClick={() => setOpen(o => !o)}>
        <span className="qw-header-icon">⚾</span>
        <h2 className="qw-header-title">새 직관 기록 작성</h2>
        <span className="qw-toggle">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="qw-body">
          <RecordForm
            key={formKey}
            teams={teams}
            onSubmit={handleSubmit}
            onCancel={() => setFormKey(k => k + 1)}
          />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showForm = pathname === '/';
  const [records, setRecords] = useState([]);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [teams] = useState(KBO_TEAMS);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  function fetchRecords() {
    setLoading(true);
    const params = {};
    if (filterTeam) params.team = filterTeam;
    if (filterYear) params.year = filterYear;
    const isFiltered = Object.keys(params).length > 0;
    getRecords(params)
      .then(r => {
        const data = r.data || [];
        if (data.length === 0 && !isFiltered) {
          setRecords(MOCK_RECORDS);
          setUseMock(true);
        } else {
          setRecords(data);
          setUseMock(false);
        }
      })
      .catch(() => {
        let mock = MOCK_RECORDS;
        if (params.year) mock = mock.filter(r => r.date?.startsWith(params.year));
        if (params.team) mock = mock.filter(r => [r.home_team, r.away_team, r.my_team].includes(params.team));
        setRecords(mock);
        setUseMock(true);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchRecords(); }, [filterTeam, filterYear]);

  const sorted = [...records].sort((a, b) =>
    sortOrder === 'latest'
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="home">
      {showForm && <QuickWriteCard teams={teams} onSaved={fetchRecords} />}

      <div className="home-list-section">
        <div className="home-topbar">
          <h2 className="home-title">직관 기록 목록</h2>
          <div className="home-topbar-right">
            {useMock && <span className="home-mock-badge">더미 데이터</span>}
            <select
              className="home-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>

        <div className="home-filters">
          <select
            className="home-filter-chip"
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
          >
            <option value="">전체 팀</option>
            {KBO_TEAMS.map(t => (
              <option key={t.id} value={t.id}>{t.id}</option>
            ))}
          </select>
          <select
            className="home-filter-chip"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">전체 연도</option>
            {years.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="home-loading">
            <div className="home-loading-spinner" />
            <p>기록 불러오는 중...</p>
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            emoji="⚾"
            title="아직 직관 기록이 없어요"
            description="위에서 첫 번째 직관 기록을 남겨보세요!"
          />
        ) : (
          <div className="home-record-list">
            {sorted.map(r => (
              <RecordCard key={`${pathname}-${r.id}`} record={r} onDelete={fetchRecords} />
            ))}
            <button className="home-more-btn" onClick={() => navigate('/list')}>
              더 불러오기 ∨
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
