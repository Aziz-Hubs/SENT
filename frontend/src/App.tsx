import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';

// ERP
import CapitalDashboard from '@/pages/erp/capital/Dashboard';
import PeopleDashboard from '@/pages/erp/people/Dashboard';
import StockDashboard from '@/pages/erp/stock/Dashboard';
import POSPage from '@/pages/erp/stock/POS';

// MSP
import PilotDashboard from '@/pages/msp/pilot/Dashboard';
import PulseDashboard from '@/pages/msp/pulse/Dashboard';

function App() {
    return (
        <Shell>
            <div className="p-8">
                <Routes>
                    <Route path="/" element={<Navigate to="/erp/capital" replace />} />

                    {/* ERP Routes */}
                    <Route path="/erp/capital" element={<CapitalDashboard />} />
                    <Route path="/erp/people" element={<PeopleDashboard />} />
                    <Route path="/erp/stock" element={<StockDashboard />} />
                    <Route path="/erp/stock/pos" element={<POSPage />} />

                    {/* MSP Routes */}
                    <Route path="/msp/pilot" element={<PilotDashboard />} />
                    <Route path="/msp/pulse" element={<PulseDashboard />} />
                </Routes>
            </div>
        </Shell>
    );
}

export default App;
