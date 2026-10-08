import { useState, useEffect } from 'react'

export default function IntroOverlay() {
  const [stage, setStage] = useState<'text1' | 'text2' | 'fadeout' | 'hidden'>('text1')

  useEffect(() => {
    // Stage 1: "Add butter"
    const t1 = setTimeout(() => {
      setStage('text2')
    }, 900)

    // Stage 2: "It's a whole new timeline."
    const t2 = setTimeout(() => {
      setStage('fadeout')
    }, 2000)

    // Stage 3: Hide completely
    const t3 = setTimeout(() => {
      setStage('hidden')
    }, 2600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  if (stage === 'hidden') return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-butter-black text-butter-white pointer-events-none transition-opacity duration-600 ${
        stage === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative text-center px-6">
        <h2
          className={`font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight transition-all duration-500 transform ${
            stage === 'text1'
              ? 'opacity-100 translate-y-0'
              : stage === 'text2'
              ? 'opacity-0 -translate-y-4 pointer-events-none absolute inset-0'
              : 'opacity-0'
          }`}
        >
          Experience Oru.
        </h2>
        <h2
          className={`font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight transition-all duration-500 transform ${
            stage === 'text2'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none absolute inset-0'
          }`}
        >
          It's a whole new timeline.
        </h2>
      </div>
    </div>
  )
}
