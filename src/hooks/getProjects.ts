import { api } from '@/trpc/react'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { useUser } from '@clerk/nextjs'

const GetProject = () => {
    const { user } = useUser()
    const [projectId, setProjectId] = useLocalStorage('projectId', '')
    const {data : projects} = api.project.getProjects.useQuery(undefined, {
        enabled: !!user // Only run query when user exists
    })
    
    const project = projects?.find(project => project.id === projectId)

    if (!user) {
        return {
            projects: [],
            project: null,
            projectId: '',
            setProjectId: () => {}
        }
    }
    
    return {
        projects,
        project,
        projectId,
        setProjectId
    }
}

export default GetProject