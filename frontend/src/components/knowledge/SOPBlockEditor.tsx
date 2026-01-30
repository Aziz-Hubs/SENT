import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, Link as LinkIcon, Save } from 'lucide-react'

/**
 * SOPBlockEditor provides a Notion-like editing experience for Standard Operating Procedures.
 */
export function SOPBlockEditor({ content, onSave }: { content: string, onSave: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content: content,
  })

  if (!editor) return null

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {
          const url = prompt('Enter URL')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button size="sm" className="gap-2 bg-blue-600" onClick={() => onSave(editor.getHTML())}>
            <Save className="h-3.5 w-3.5" /> Save SOP
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="p-6 prose prose-invert max-w-none min-h-[400px] focus:outline-none" />
    </div>
  )
}
