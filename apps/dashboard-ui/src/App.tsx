import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RegionProvider } from './contexts/RegionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';
import PWAInstallBanner from './components/PWAInstallBanner';
import OfflineBanner from './components/OfflineBanner';
import SWUpdateBanner from './components/SWUpdateBanner';
import LoginPage from './views/LoginPage';
import ProfilePage from './views/ProfilePage';
import SyncMonitor from './views/SyncMonitor';
import EdgeRegistry from './views/EdgeRegistry';
import NotificationsPage from './views/NotificationsPage';
import SystemHealth from './views/SystemHealth';
import AboutPage from './views/AboutPage';
import LiveDashboard from './views/LiveDashboard';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import EHRD from './views/EHRD';
import Akreditasi from './views/Akreditasi';
import Karir from './views/Karir';
import Karya from './views/Karya';
import Approval from './views/Approval';

import KlopLayout from './views/Klop/KlopLayout';
import KlopHome from './views/Klop/Home';
import KlopKnowledge from './views/Klop/Knowledge';
import KlopKnowledgeDetail from './views/Klop/KnowledgeDetail';
import KlopElearning from './views/Klop/elearning';
import CourseDetail from './views/Klop/elearning/CourseDetail';
import TalkshowPage from './views/Klop/talkshow';
import ForumPage from './views/Klop/forum';
import ForumDetailPage from './views/Klop/forum/Detail';
import JurnalPage from './views/Klop/jurnal';
import JurnalDetailPage from './views/Klop/jurnal/Detail';
import KomunitasPage from './views/Klop/komunitas';
import KaryaDetailPage from './views/Klop/komunitas/Detail';

import KinerjaLayout from './views/Kinerja/KinerjaLayout';
import KinerjaHome from './views/Kinerja/Home';
import SKPList from './views/Kinerja/SKPList';
import SKPForm from './views/Kinerja/SKPForm';
import SKPDetail from './views/Kinerja/SKPDetail';
import Cetak from './views/Kinerja/Cetak';
import HK from './views/Kinerja/HK';
import TTE from './views/Kinerja/TTE';
import PDFTools from './views/Kinerja/PDFTools';
import Pengaturan from './views/Kinerja/Pengaturan';
import Unduh from './views/Kinerja/Unduh';
import Video from './views/Kinerja/Video';
import Rekap from './views/Kinerja/Rekap';
import Pembinaan from './views/Kinerja/Pembinaan';

import Karyasiswa from './views/Karyasiswa';
import Spasi from './views/Spasi';
import Ticketing from './views/Ticketing';

function Root() {
  return (
    <>
      <OfflineBanner />
      <ToastContainer />
      <PWAInstallBanner />
      <SWUpdateBanner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/approval" element={<ProtectedRoute><Approval /></ProtectedRoute>} />
        <Route path="/sync-monitor" element={<ProtectedRoute><SyncMonitor /></ProtectedRoute>} />
        <Route path="/edge-registry" element={<ProtectedRoute><EdgeRegistry /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
        <Route path="/live-dashboard" element={<ProtectedRoute><LiveDashboard /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />

        <Route path="/karyasiswa" element={<ProtectedRoute><Karyasiswa /></ProtectedRoute>} />
        <Route path="/spasi" element={<ProtectedRoute><Spasi /></ProtectedRoute>} />
        <Route path="/ticketing" element={<ProtectedRoute><Ticketing /></ProtectedRoute>} />

        <Route path="/klop" element={<ProtectedRoute><KlopLayout /></ProtectedRoute>}>
          <Route index element={<KlopHome />} />
          <Route path="knowledge" element={<KlopKnowledge />} />
          <Route path="knowledge/:id" element={<KlopKnowledgeDetail />} />
          <Route path="elearning" element={<KlopElearning />} />
          <Route path="elearning/:id" element={<CourseDetail />} />
          <Route path="talkshow" element={<TalkshowPage />} />
          <Route path="forum" element={<ForumPage />} />
          <Route path="forum/:id" element={<ForumDetailPage />} />
          <Route path="jurnal" element={<JurnalPage />} />
          <Route path="jurnal/:id" element={<JurnalDetailPage />} />
          <Route path="komunitas" element={<KomunitasPage />} />
          <Route path="komunitas/:id" element={<KaryaDetailPage />} />
        </Route>

        <Route path="/kinerja" element={<ProtectedRoute><KinerjaLayout /></ProtectedRoute>}>
          <Route index element={<KinerjaHome />} />
          <Route path="skp" element={<SKPList />} />
          <Route path="skp/new" element={<SKPForm />} />
          <Route path="skp/:id" element={<SKPDetail />} />
          <Route path="cetak" element={<Cetak />} />
          <Route path="hk" element={<HK />} />
          <Route path="tte" element={<TTE />} />
          <Route path="pdf-tools" element={<PDFTools />} />
          <Route path="pengaturan" element={<Pengaturan />} />
          <Route path="unduh" element={<Unduh />} />
          <Route path="video" element={<Video />} />
          <Route path="rekap" element={<Rekap />} />
          <Route path="pembinaan" element={<Pembinaan />} />
        </Route>

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="ehrd" element={<EHRD />} />
          <Route path="akreditasi" element={<Akreditasi />} />
          <Route path="karir" element={<Karir />} />
          <Route path="karya" element={<Karya />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RegionProvider>
          <NotificationProvider>
            <Root />
          </NotificationProvider>
        </RegionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}