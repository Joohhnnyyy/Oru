import { Link } from 'react-router-dom';
import { WorldScene } from '../../components/WorldScene';
export default function Verify() {
  return <WorldScene title={<>Your little world.<br />One sign-in away.</>} intro="Email code sign-in is not available yet. Use your existing email and password." step="SIGN IN" back="/signin" character="turtle"><h2>Continue with your account.</h2><p>No verification code has been sent.</p><Link className="btn btn-play" to="/signin">Sign in with email and password</Link></WorldScene>;
}
