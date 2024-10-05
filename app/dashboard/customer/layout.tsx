
import React from 'react'

const CustomerLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {children}
    </div>
  )
}

export default CustomerLayout
