import dynamic from 'next/dynamic'
import OneDarkPro from './theme/onedarkpro.json'
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
})

export function MonacoEditor({ code }: { code: string }) {
  const handleEditorDidMount = (monaco: any) => {
    monaco.editor.defineTheme('OneDarkPro', {
      base: 'vs-dark',
      inherit: true,
      ...OneDarkPro,
    })
  }
  return (
    <Editor
      height={'70vh'}
      width={'100%'}
      // language="typescript"
      defaultLanguage="typescript"
      theme="OneDarkPro"
      value={code}
      beforeMount={handleEditorDidMount}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        padding: { top: 20, bottom: 20 },
      }}
    />
  )
}
