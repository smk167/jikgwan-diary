import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getKboTeams, createRecord, getRecord, updateRecord } from '../api';
// [PHOTOS DISABLED] import { uploadPhotos, deletePhoto } from '../api';
import { KBO_TEAMS } from '../data/mockData';
import RecordForm from '../components/ui/RecordForm';
import './Write.css';

export default function Write() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [teams, setTeams] = useState(KBO_TEAMS);
  const [initialValues, setInitialValues] = useState(null);
  // [PHOTOS DISABLED] const [initialPhotos, setInitialPhotos] = useState([]);

  useEffect(() => {
    setInitialValues(null);

    getKboTeams()
      .then(r => { if (r.data?.length) setTeams(r.data.map(t => ({ id: t.short, name: t.name, stadiums: [t.stadium] }))); })
      .catch(() => {});

    if (isEdit) {
      getRecord(id)
        .then(r => {
          const d = r.data;
          setInitialValues({
            date: d.date,
            home_team: d.home_team,
            away_team: d.away_team,
            stadium: d.stadium,
            my_team: d.my_team,
            result: d.result,
            score_home: d.score_home,
            score_away: d.score_away,
            comment: d.comment || '',
            memo: d.memo || '',
            food: d.food || '',
            weather: d.weather ? d.weather.split(' ').filter(Boolean) : [],
            seat: d.seat || '',
            companion: d.companion || '',
          });
          // [PHOTOS DISABLED] setInitialPhotos(d.photos || []);
        })
        .catch(() => { setInitialValues({}); /* [PHOTOS DISABLED] setInitialPhotos([]); */ });
    } else {
      setInitialValues({});
    }
  }, [id]);

  async function handleSubmit(submitData, newPhotos, deletedPhotoIds) {
    let recordId = id;
    if (isEdit) {
      await updateRecord(id, submitData);
    } else {
      const res = await createRecord(submitData);
      recordId = res.data.id;
    }
    // [PHOTOS DISABLED]
    // if (deletedPhotoIds.length > 0) {
    //   await Promise.all(deletedPhotoIds.map(pid => deletePhoto(pid)));
    // }
    // if (newPhotos.length > 0) {
    //   const fd = new FormData();
    //   newPhotos.forEach(p => fd.append('photos', p));
    //   await uploadPhotos(recordId, fd);
    // }
    navigate(isEdit ? `/record/${id}` : '/');
  }

  return (
    <div className="write">
      <header className="write-header">
        <button className="write-back" onClick={() => navigate(-1)}>← 뒤로</button>
        <h1 className="write-title">
          {isEdit ? '✏️ 기록 수정' : '⚾ 새 직관 기록 작성'}
        </h1>
      </header>

      {initialValues === null ? (
        <div className="write-loading">불러오는 중...</div>
      ) : (
        <RecordForm
          key={id || 'new'}
          teams={teams}
          initialValues={initialValues}
          // [PHOTOS DISABLED] initialPhotos={initialPhotos}
          isEdit={isEdit}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
