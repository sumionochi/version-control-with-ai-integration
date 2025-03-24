'use client'
import React from 'react'
import { ButtonGroup, Button } from '@progress/kendo-react-buttons'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useDarkMode } from '@/hooks/useDarkMode'

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[]
}

const SourceCodeRef = ({ filesReferences }: Props) => {
  const defaultFile = filesReferences[0]?.fileName || ''
  const [tab, setTab] = React.useState(defaultFile)
  const isDarkMode = useDarkMode()

  React.useEffect(() => {
    if (filesReferences.length > 0 && filesReferences[0]?.fileName) {
      setTab(filesReferences[0].fileName)
    }
  }, [filesReferences])
  
  if (filesReferences.length === 0) return null

  return (
    <div className={`max-w-[54rem] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`flex flex-wrap gap-2 p-2 rounded-md ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
      }`}>
        {filesReferences.map(file => (
          <Button
            key={file.fileName}
            selected={tab === file.fileName}
            onClick={() => setTab(file.fileName)}
            className={`text-sm font-medium whitespace-nowrap hover:bg-orange-400 hover:text-white ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{
              backgroundColor: tab === file.fileName ? '#f97316' : isDarkMode ? 'transparent' : 'transparent',
              color: tab === file.fileName ? 'white' : isDarkMode ? 'white' : 'inherit'
            }}
          >
            {file.fileName}
          </Button>
        ))}
      </div>
      <div className={`max-h-[40vh] overflow-scroll mt-2 rounded-md ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        {filesReferences.map(file => (
          file.fileName === tab && (
            <SyntaxHighlighter 
              key={file.fileName}
              language="typescript" 
              style={lucario}
              className={isDarkMode ? 'bg-transparent' : ''}
            >
              {file.sourceCode}
            </SyntaxHighlighter>
          )
        ))}
      </div>
    </div>
  )
}

export default SourceCodeRef