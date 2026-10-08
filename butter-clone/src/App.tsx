import { useLenis } from './hooks/useLenis'
import PageShell from './components/layout/PageShell'

export default function App() {
  useLenis()
  return <PageShell />
}
