import React, { useEffect, useState } from 'react';
import './App.css';

export default function App() {
  const [runs, setRuns] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState('');
  const [selectedFlow, setSelectedFlow] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/runs')
      .then((res) => res.json())
      .then((data) => {
        console.log('Data:', data);
        setRuns(data);
        if (data.length > 0) {
          setSelectedBuild(data[0].build);
          setSelectedFlow(data[0].flows[0]);
        }
      });
  }, []);

  const run = runs.find((r) => r.build === selectedBuild);

  return (
    <div className="app">
      <header>
        <h1>📸 Visual Regression Viewer</h1>
        <select onChange={(e) => setSelectedBuild(e.target.value)} value={selectedBuild}>
          {runs.map((r) => (
            <option key={r.build} value={r.build}>
              {r.build}
            </option>
          ))}
        </select>
      </header>

      <aside>
        <h3>Flows</h3>
        {run?.flows.map((flow) => (
          <button
            key={flow}
            onClick={() => setSelectedFlow(flow)}
            className={flow === selectedFlow ? 'active' : ''}>
            {flow}
          </button>
        ))}
      </aside>

      <main>
        {selectedBuild && selectedFlow && <Viewer build={selectedBuild} flow={selectedFlow} />}
      </main>
    </div>
  );
}
function Viewer({ build, flow }) {
  const base = `/screenshots/${build}/${flow}/${flow}`;
  const [analysis, setAnalysis] = useState([]);

  useEffect(() => {
    fetch(`/screenshots/${build}/${flow}/${flow}-analysis.json`)
      .then((res) => res.json())
      .then((json) => setAnalysis(json.result));
  }, [build, flow]);

  return (
    <div className="viewer">
      <div className="images">
        <img src={`${base}-baseline.png`} alt="baseline" />
        <img src={`${base}-current.png`} alt="current" />
        <img src={`${base}-diff.png`} alt="diff" />
      </div>
      {/* <ul>
        {analysis.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul> */}
    </div>
  );
}

function MultiViewer({ builds, selectedFlow }) {
  return (
    <div className="multi-viewer">
      <h2>{selectedFlow} – Build Comparison</h2>
      <div className="build-grid">
        {builds.map((build) => {
          const base = `/screenshots/${build}/${selectedFlow}/${selectedFlow}`;
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const metrics = require(
            `../screenshots/${build}/${selectedFlow}/${selectedFlow}-metrics.json`
          );
          return (
            <div key={build} className="build-column">
              <h3>{build}</h3>
              <img src={`${base}-baseline.png`} alt="baseline" />
              <img src={`${base}-current.png`} alt="current" />
              <img src={`${base}-diff.png`} alt="diff" className="highlight-boxes" />
              <div className="metrics">
                <p>Diff Pixels: {metrics.pixelDiff}</p>
                <p>Percent Changed: {metrics.percent}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
