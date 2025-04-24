import 'trix'
import 'trix/dist/trix.css'
import { useRef, useEffect } from 'react'

export default function ArticleEditor({ postContent, setPostContent }) {
  const trixInputRef = useRef(null)

  useEffect(() => {
    if (trixInputRef.current) {
      trixInputRef.current.editor.loadHTML(postContent)
    }
  }, [postContent])

  const handleTrixChange = (e) => {
    setPostContent(e.target.innerHTML)
  }

  return (
    <div className="flex flex-col mb-2">
      <input id="trix-input" type="hidden" />
      <trix-editor
        ref={trixInputRef}
        input="trix-input"
        onChange={handleTrixChange}
        class="trix-content min-h-[80px] md:min-h-[100px] border rounded p-2 text-sm"
      ></trix-editor>
    </div>
  )
}
