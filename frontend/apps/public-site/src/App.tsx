import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Classes } from "./pages/Classes";
import { Home } from "./pages/Home";
import { ComingSoon } from "./pages/ComingSoon";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Club } from "./pages/Club";
import { Plans } from "./pages/Plans";
import { Offers } from "./pages/Offers";
import { Loyalty } from "./pages/Loyalty";
import { Contact } from "./pages/Contact";
import { Dashboard } from "./pages/Dashboard";
import { Membership } from "./pages/member/Membership";
import { MemberCard } from "./pages/member/MemberCard";
import { Attendance } from "./pages/member/Attendance";
import { LoyaltyDashboard } from "./pages/member/LoyaltyDashboard";
import { Rewards } from "./pages/member/Rewards";
import { Challenges } from "./pages/member/Challenges";
import { Referral } from "./pages/member/Referral";
import { Payments } from "./pages/member/Payments";
import { History } from "./pages/member/History";
import { Notifications } from "./pages/member/Notifications";
import { Support } from "./pages/member/Support";
import { Profile } from "./pages/member/Profile";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  const isMemberArea = pathname.startsWith("/espace-membre");

  return (
    <>
      <ScrollToTop />
      {!isMemberArea && <Header />}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cours" element={<Classes />} />
          <Route path="/le-club" element={<Club />} />
          <Route path="/abonnements" element={<Plans />} />
          <Route path="/offres" element={<Offers />} />
          <Route path="/fidelite" element={<Loyalty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/rejoindre" element={<Signup />} />
          <Route path="/espace-membre" element={<Dashboard />} />
          <Route path="/espace-membre/abonnement" element={<Membership />} />
          <Route path="/espace-membre/carte" element={<MemberCard />} />
          <Route path="/espace-membre/assiduite" element={<Attendance />} />
          <Route
            path="/espace-membre/fidelite"
            element={<LoyaltyDashboard />}
          />
          <Route path="/espace-membre/recompenses" element={<Rewards />} />
          <Route path="/espace-membre/defis" element={<Challenges />} />
          <Route path="/espace-membre/parrainage" element={<Referral />} />
          <Route path="/espace-membre/paiements" element={<Payments />} />
          <Route path="/espace-membre/historique" element={<History />} />
          <Route
            path="/espace-membre/notifications"
            element={<Notifications />}
          />
          <Route path="/espace-membre/support" element={<Support />} />
          <Route path="/espace-membre/profil" element={<Profile />} />
          <Route
            path="/mot-de-passe-oublie"
            element={
              <ComingSoon
                eyebrow="Mot de passe oublié"
                title="Réinitialisation du mot de passe"
                description="Ce parcours arrive avec l'espace membre — en attendant, contactez l'accueil."
              />
            }
          />
          <Route
            path="/legal"
            element={
              <ComingSoon
                eyebrow="Légal"
                title="Confidentialité & mentions légales"
                description="Les documents légaux du club seront publiés ici."
              />
            }
          />
          <Route
            path="*"
            element={
              <ComingSoon
                eyebrow="404"
                title="Cette page est hors parcours."
                description="Retrouvez nos cours, nos abonnements ou contactez le club depuis le menu."
              />
            }
          />
        </Routes>
      </main>
      {!isMemberArea && <Footer />}
    </>
  );
}

export default App;
