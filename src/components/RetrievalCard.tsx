"use client"
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, CardActions } from '@progress/kendo-react-layout'
import { Button } from '@progress/kendo-react-buttons'
import { Input, TextArea } from '@progress/kendo-react-inputs'
import { Loader } from '@progress/kendo-react-indicators'
import { useDarkMode } from '@/hooks/useDarkMode'
import { Dialog } from '@progress/kendo-react-dialogs'
import GetProject from '@/hooks/getProjects'
import { askQuestion } from '@/hooks/actions'
import { readStreamableValue } from 'ai/rsc'
import { usePathname } from 'next/navigation'
import { Editor } from '@progress/kendo-react-editor'
import MDEditor from '@uiw/react-md-editor'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ComponentProps } from 'react'
import SourceCodeRef from './SourceCodeRef'
import { api } from '@/trpc/react'
import { Notification, NotificationGroup } from '@progress/kendo-react-notification'

interface CodeProps extends ComponentProps<'code'> {
  inline?: boolean;
}

const RetrievalCard = () => {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState('')
  const isDarkMode = useDarkMode()
  const [filesReferences, setFilesReferences] = useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
  
  const {projects} = GetProject()
  const pathname = usePathname();
  const projectId = pathname.split('/').pop() 
  const project = projects?.find(p => p.id === projectId)

  const [answer, setAnswer] = useState('')
  
  const handleAskQuestion = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('asked question :', question)
    e.preventDefault()
    console.log('project :', project)
    console.log('project name :', project?.name)
    console.log('project id :', project?.id)
    if(!project?.id) return
    console.log('project id :', project.id)
    setLoading(true)
    setOpen(true)

    console.log('asked question', question)

    const { output, filesReferences } = await askQuestion(question, project.id)
    setFilesReferences(filesReferences)

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer(ans => ans + delta)
      }
    }
    setLoading(false)
  }
  const saveAnswerMutation = api.project.saveAnswer.useMutation()
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ visible: false, type: 'success', message: '' });

  return (
    <>
      <NotificationGroup
        style={{
          position: 'fixed',
          bottom: '0',
          right: '0',
          zIndex: 9999
        }}
      >
        {notification.visible && (
          <Notification
            type={{
              style: notification.type === 'success' ? 'success' : 'error',
              icon: true,
            }}
            closable={true}
            onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
          >
            <span>{notification.message}</span>
          </Notification>
        )}
      </NotificationGroup>

      <Card className={`${isDarkMode ? 'dark' : 'light'} transition-colors duration-200 w-full`}>
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">What can I help with?</h2>
            <p className="text-sm text-[var(--text-secondary)]">Ask anything with the knowledge of the codebase.</p>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-0">
            <TextArea
              value={question}
              onChange={(e) => setQuestion(e.value)}
              placeholder="Which file should I edit to change the home page?"
              className={`w-full h-[280px] ${
                isDarkMode 
                  ? 'bg-black' 
                  : 'bg-white text-gray-900'
              }`}
            />
          </div>
        </CardBody>
        <CardActions>
          <Button
            themeColor="primary"
            disabled={loading || !question}
            onClick={handleAskQuestion}
            className="w-full"
          >
            {loading ? <Loader size="small" /> : 'Ask Anything!'}
          </Button>
        </CardActions>
      </Card>

      {open && (
        <Dialog 
          title="Knowledge Base"
          onClose={() => {
            setOpen(false);
            setAnswer('');
            setFilesReferences([]);
          }}
          className={`${isDarkMode ? 'dark bg-gray-900 text-white' : 'light bg-white text-gray-900'} rounded-lg`}
          style={{
            '--dialog-bg': isDarkMode ? '#1a1a1a' : '#ffffff',
            '--dialog-text': isDarkMode ? '#ffffff' : '#1a1a1a',
          } as React.CSSProperties}
        >
          <div className="max-w-4xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className={`font-medium ${!isDarkMode ? '' : 'text-gray-900'}`}>Question:</div>
              <div className={`${isDarkMode ? 'bg-gray-100 text-white' : 'bg-gray-100'} p-3 rounded-lg`}>{question}</div>
              <div className="flex gap-2 w-full mt-4">
              <Button
                  themeColor="success"
                  onClick={() => {
                    if (!project?.id) {
                      setNotification({
                        visible: true,
                        type: 'error',
                        message: 'Project not found!'
                      });
                      return;
                    }
                    
                    saveAnswerMutation.mutate({
                        projectId: project.id,
                        question,
                        answer,
                        filesReferences
                    }, {
                        onSuccess: () => {
                          setNotification({
                            visible: true,
                            type: 'success',
                            message: 'Answer saved successfully!'
                          });
                          setOpen(false);
                          setAnswer('');
                          setFilesReferences([]);
                          setTimeout(() => {
                            setNotification(prev => ({ ...prev, visible: false }));
                          }, 3000);
                        },
                        onError: (error) => {
                          setNotification({
                            visible: true,
                            type: 'error',
                            message: 'Failed to save answer: ' + error.message
                          });
                          setTimeout(() => {
                            setNotification(prev => ({ ...prev, visible: false }));
                          }, 3000);
                        }
                    })
                }}
                  disabled={!answer || saveAnswerMutation.isPending}
                  className='w-full'
                >
                  {saveAnswerMutation.isPending ? <Loader size="medium" /> : 'Accept & Save Answer'}
                </Button>
                <Button
                  themeColor="error"
                  onClick={() => {
                    setOpen(false)
                    setAnswer('')
                    setFilesReferences([])
                  }}
                  className='w-full'
                >
                  Reject Answer
                </Button>
                
              </div>
              <div className={`font-medium ${!isDarkMode ? '' : 'text-gray-900'}`}>Answer:</div>
              <div data-color-mode={isDarkMode ? 'dark' : 'light'} className="bg-[var(--bg-secondary)] p-3 rounded-lg">
                <MDEditor.Markdown 
                  source={answer} 
                  components={{
                    code: (props: CodeProps) => {
                      const {inline, children, className} = props
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                />
                
              </div>
              <div className="font-medium mt-4">Files References:</div>
              <div className="flex flex-wrap gap-2">
                <SourceCodeRef filesReferences={filesReferences}/>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  )
}

export default RetrievalCard
