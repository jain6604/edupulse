import { useState, useEffect, useCallback } from 'react';
import { getWhatIf } from '../services/api';

function WhatIfSimulator({ studentId }) {
  const [seeScore, setSeeScore] = useState(75);
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSimulation = useCallback(async (see) => {
    setLoading(true);
    setError('');
    try {
      const response = await getWhatIf(studentId, see);
      setSimulationData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch simulation');
      setSimulationData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSimulation(seeScore);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [seeScore, fetchSimulation]);

  const getGradeColor = (grade) => {
    const gradeColors = {
      'O': '#34d399',    // green
      'A+': '#34d399',   // green
      'A': '#60a5fa',    // cyan
      'B+': '#60a5fa',   // cyan
      'B': '#fbbf24',    // yellow
      'C': '#fbbf24',    // yellow
      'P': '#f87171',    // orange
      'F': '#ef4444'     // red
    };
    return gradeColors[grade] || '#9ca3af';
  };

  return (
    <div className="bg-gradient-to-br from-[#0f0520] to-[#03060f] border border-[#d4af62]/30 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="text-2xl mr-2">🔮</span>
        What-If Simulator
      </h3>

      {/* SEE Score Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#60a5fa] mb-2">
          SEE Score: {seeScore}/100
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={seeScore}
          onChange={(e) => setSeeScore(parseInt(e.target.value))}
          className="w-full h-2 bg-[#1a0f2e] rounded-lg appearance-none cursor-pointer accent-[#d4af62]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-4">Loading simulation...</div>
      ) : simulationData ? (
        <>
          {/* CGPA Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1a0f2e] rounded-lg p-4 border border-[#d4af62]/20">
              <p className="text-gray-400 text-sm mb-1">Predicted CGPA</p>
              <p className="text-3xl font-bold text-[#60a5fa]">
                {simulationData.predicted_cgpa?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div className="bg-[#1a0f2e] rounded-lg p-4 border border-[#d4af62]/20">
              <p className="text-gray-400 text-sm mb-1">Total Credit Points</p>
              <p className="text-3xl font-bold text-[#d4af62]">
                {simulationData.total_credit_points?.toFixed(0) || 'N/A'}
              </p>
            </div>
          </div>

          {/* Subjects Table */}
          {simulationData.simulated_marks && simulationData.simulated_marks.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d4af62]/30">
                    <th className="text-left py-3 px-3 text-[#60a5fa] font-semibold">Subject</th>
                    <th className="text-center py-3 px-3 text-[#60a5fa] font-semibold">Marks</th>
                    <th className="text-center py-3 px-3 text-[#60a5fa] font-semibold">Grade</th>
                    <th className="text-center py-3 px-3 text-[#60a5fa] font-semibold">Credits</th>
                    <th className="text-center py-3 px-3 text-[#60a5fa] font-semibold">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationData.simulated_marks.map((subject, idx) => (
                    <tr key={idx} className="border-b border-[#1a0f2e] hover:bg-[#1a0f2e]/50 transition">
                      <td className="py-3 px-3 text-gray-300">{subject.subject_name}</td>
                      <td className="text-center py-3 px-3 text-gray-300">{subject.final_total?.toFixed(1)}/100</td>
                      <td className="text-center py-3 px-3">
                        <span
                          className="px-2 py-1 rounded text-white font-semibold text-xs"
                          style={{ backgroundColor: getGradeColor(subject.grade) }}
                        >
                          {subject.grade}
                        </span>
                      </td>
                      <td className="text-center py-3 px-3 text-gray-300">{subject.credits}</td>
                      <td className="text-center py-3 px-3 text-[#60a5fa] font-semibold">
                        {subject.credit_points?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!simulationData.simulated_marks || simulationData.simulated_marks.length === 0 && (
            <div className="text-center text-gray-400 py-4">No MSRIT scores found to simulate</div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400 py-4">No simulation data available</div>
      )}
    </div>
  );
}

export default WhatIfSimulator;
