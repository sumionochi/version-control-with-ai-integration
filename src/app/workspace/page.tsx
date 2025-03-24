'use client'
import React, { useEffect, useState } from 'react'
import { Dialog } from '@progress/kendo-react-dialogs'
import { Card, CardHeader, CardTitle, CardBody } from '@progress/kendo-react-layout'
import { DateTimePicker } from '@progress/kendo-react-dateinputs'
import { api } from '@/trpc/react'
import { useDarkMode } from '@/hooks/useDarkMode'
import MDEditor from '@uiw/react-md-editor'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import SourceCodeRef from '@/components/SourceCodeRef'
import { usePathname } from 'next/navigation'
import GetProject from '@/hooks/getProjects'
import { DropDownList } from '@progress/kendo-react-dropdowns'
import { DropDownListChangeEvent } from "@progress/kendo-react-dropdowns";
import { ProgressBar } from '@progress/kendo-react-progressbars'

interface CodeProps extends React.ComponentProps<'code'> {
  inline?: boolean;
}

interface Project {
  name: string;
  githubUrl: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const WorkSpace = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const isDarkMode = useDarkMode()
  const { projects } = GetProject()

  const { data: questions, isLoading } = api.project.getQuestions.useQuery(
    {
      projectId: selectedProjectId || projects?.[0]?.id || '',
    }
  )

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + 2;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 50);

      return () => {
        clearInterval(timer);
        setProgress(0);
      };
    }
  }, [isLoading]);

  const [progress, setProgress] = useState(0)
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)

  const filteredQuestions = questions?.filter(q => {
    if (!selectedDateTime) return true;
    
    const questionDateTime = new Date(q.createdAt);
    const filterDate = selectedDateTime;

    const timeDiff = Math.abs(questionDateTime.getTime() - filterDate.getTime());
    const oneMinute = 60 * 1000; 

    return (
      questionDateTime.getFullYear() === filterDate.getFullYear() &&
      questionDateTime.getMonth() === filterDate.getMonth() &&
      questionDateTime.getDate() === filterDate.getDate() &&
      timeDiff < oneMinute
    );
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <DropDownList
            data={projects || []}
            textField="name"
            dataItemKey="id"
            value={projects?.find(p => p.id === selectedProjectId)}
            onChange={(e: DropDownListChangeEvent) => setSelectedProjectId(e.value?.id || '')}
            loading={!projects}
            defaultItem={{ name: "Select a project", id: "" }}
            className={isDarkMode ? 'k-dark' : ''}
          />
        </div>
        <DateTimePicker
          value={selectedDateTime}
          onChange={(e) => setSelectedDateTime(e.value)}
          format="MM/dd/yyyy HH:mm"
          className={isDarkMode ? 'k-dark' : ''}
        />
      </div>

      <h1 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Saved Questions & Answers
          </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-8 px-4">
            <ProgressBar
              value={progress}
              max={100}
              animation={{ duration: 400 }}
              progressClassName={isDarkMode ? 'bg-orange-500' : 'bg-orange-600'}
              className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            />
            <p className={`text-center mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading questions... {progress}%
            </p>
          </div>
        ) : filteredQuestions && filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <Card 
              key={q.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                isDarkMode 
                  ? 'bg-gray-800 text-white border border-gray-700' 
                  : 'bg-white'
              }`}
              onClick={() => setSelectedQuestion(q)}
            >
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {q.question}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(q.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 bg-orange-300">
            <p className="text-red-500">No questions found.</p>
            <h1 className='font-medium'>Search the Knowledge Base!</h1>
          </div>
        )}
      </div>

      {selectedQuestion && (
        <Dialog
          title="Question Details"
          onClose={() => setSelectedQuestion(null)}
          className={`${isDarkMode ? 'dark bg-gray-900 text-white' : 'light bg-white text-gray-900'} rounded-lg`}
          style={{
            '--dialog-bg': isDarkMode ? '#1a1a1a' : '#ffffff',
            '--dialog-text': isDarkMode ? '#ffffff' : '#1a1a1a',
          } as React.CSSProperties}
        >
          <div className="max-w-4xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-4">
              <div className="font-medium">Question:</div>
              <div className={`${isDarkMode ? 'bg-gray-100' : 'bg-gray-100'} p-3 rounded-lg`}>
                {selectedQuestion.question}
              </div>

              <div className="font-medium">Answer:</div>
              <div data-color-mode={isDarkMode ? 'dark' : 'light'} className="bg-[var(--bg-secondary)] p-3 rounded-lg">
                <MDEditor.Markdown 
                  source={selectedQuestion.answer}
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

              <div className="font-medium">Files References:</div>
              <SourceCodeRef filesReferences={selectedQuestion.filesReferences} />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default WorkSpace
