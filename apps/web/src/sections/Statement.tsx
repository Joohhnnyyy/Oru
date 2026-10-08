import { EditorStatement } from './CreativeEditorSection/components/EditorStatement'
import { EditorShowcase } from './CreativeEditorSection/components/EditorShowcase'

export default function Statement() {
  return (
    <section
      id="statement"
      aria-label="Creative video editor"
      className="overflow-hidden"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-[59.9298px]">
        <EditorStatement />
        <EditorShowcase />
      </div>
    </section>
  )
}
