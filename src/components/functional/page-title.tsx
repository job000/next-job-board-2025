import React from 'react'

function PageTitle({ title }: { title: string }) {
  return (
    <h1 className='text-xl font-bold text-primary'>
      {title}
    </h1>
  )
}

export default PageTitle
