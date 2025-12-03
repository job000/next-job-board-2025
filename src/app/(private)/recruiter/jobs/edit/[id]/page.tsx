import JobForm from '@/components/functional/job-form'
import PageTitle from '@/components/functional/page-title'
import React from 'react'

function EditJobPage() {
  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title="Edit Job" />
      <JobForm />
    </div>
  )
}

export default EditJobPage
