import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('http://localhost:3001/api/runs');
      const data = await res.json();
      setRuns(data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Visual Regression Results</h1>
      {runs.map((run) => (
        <div
          key={run.name}
          style={{ border: '1px solid #ccc', marginBottom: '2rem', padding: '1rem' }}>
          <h2>{run.name}</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <strong>Baseline</strong>
              <br />
              <img src={run.baseline} width="250" />
            </div>
            <div>
              <strong>Current</strong>
              <br />
              <img src={run.current} width="250" />
            </div>
            <div>
              <strong>Diff</strong>
              <br />
              <img src={run.diff} width="250" />
            </div>
          </div>
          <h3>Analysis</h3>
          <pre>{run.analysis}</pre>
        </div>
      ))}
    </div>
  );
}

export default App;
