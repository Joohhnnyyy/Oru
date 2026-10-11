import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Feedback } from '../../components/AccountPage';
import { WorldScene } from '../../components/WorldScene';
import { useAuth } from '../../context/AuthContext';
import { currentPosition } from '../../lib/location';
import { errorMessage } from '../../hooks/useApiResource';
import { setLanguage as applyLanguage, storedLanguage } from '../../i18n';

export default function Onboarding() {
  const { profile, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [language, setLanguage] = useState<'en' | 'hi'>(() => profile?.language ?? storedLanguage() ?? 'en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stage = pathname.endsWith('reveal') ? 'reveal' : pathname.endsWith('location') || pathname.endsWith('location-denied') ? 'location' : 'language';
  async function finish() {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      if (!profile) {
        const position = await currentPosition();
        await completeOnboarding(language, position.latitude, position.longitude);
      }
      await applyLanguage(language);
      navigate('/onboarding/reveal');
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }
  const title = stage === 'language' ? <>A little world.<br />In your own words.</> : stage === 'location' ? <>Every world<br />starts somewhere.</> : <>Someone is<br />waiting for you.</>;
  return <WorldScene title={title} intro={stage === 'language' ? 'Choose the language that feels like home.' : stage === 'location' ? 'Find your neighbourhood and the guardian who belongs there.' : 'A small beginning. A world that grows with you.'} step={stage === 'language' ? '01 / MAKE YOURSELF AT HOME' : stage === 'location' ? '02 / FIND YOUR CORNER' : '03 / MEET YOUR GUARDIAN'} back={stage === 'language' ? '/signin' : stage === 'location' ? '/onboarding/language' : '/onboarding/location'} character={stage === 'reveal' ? 'dolphin' : 'buddy'} reveal={stage === 'reveal'} footer="A small beginning. A world that grows with you.">
    {stage === 'language' && <><h2>Make yourself at home.</h2><fieldset><legend className="sr-only">Preferred language</legend><div className="world-languages">{(['en', 'hi'] as const).map(value => <label key={value}><input type="radio" name="language" value={value} checked={language === value} onChange={() => setLanguage(value)} /><span lang={value}>{value === 'en' ? 'English' : 'हिन्दी'}</span></label>)}</div></fieldset><button className="btn btn-play" type="button" disabled={busy} onClick={async () => { setBusy(true); try { await applyLanguage(language); navigate('/onboarding/location'); } finally { setBusy(false); } }}>Continue ↗</button><p className="text-sm">You can change your language later.</p></>}
    {stage === 'location' && <><h2>Find your corner of the world.</h2><p>Location connects you to your home territory and helps verify nearby actions. Your browser asks for permission when you continue.</p><Feedback error={error} /><button type="button" disabled={busy} onClick={() => void finish()} className="btn btn-play">{busy ? 'Finding your territory…' : profile ? 'Meet my guardian ↗' : 'Use my location and continue ↗'}</button><details><summary className="cursor-pointer text-sm text-primary">Location not available?</summary><p className="mt-3 text-sm">Allow location for this site in your browser settings, then try again. Oru needs a real location to assign your home territory.</p></details></>}
    {stage === 'reveal' && <><h2>Your little world awaits.</h2>{profile ? <><p>Your home territory is <strong className="break-all">{profile.homeTerritoryId || 'being assigned'}</strong>. Small, real actions help your shared territory grow.</p><Link to="/home" className="btn btn-play">Step into my world ↗</Link></> : <><p>Set up your territory before entering your world.</p><Link to="/onboarding/location" className="btn btn-play">Find my territory ↗</Link></>}</>}
  </WorldScene>;
}
