import { createFileRoute } from '@tanstack/react-router'
import { Repl, type ReplRef } from '@/components/CustomRepl'
import { pg_lite } from '@/lib/db'
import { Terminal } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { useMCPSQLTool } from '@/hooks/useMCPSQLTool'

export const Route = createFileRoute('/_dashboard/sql-repl')({
  component: SQLReplPage,
})

export let replRef: ReplRef | null = null

function SQLReplPage() {
  const localReplRef = useRef<ReplRef>(null)

  useMCPSQLTool()

  useEffect(() => {
    replRef = localReplRef.current
    return () => {
      replRef = null
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">SQL REPL</h1>
            <p className="text-xs text-muted-foreground">Interactive PostgreSQL terminal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Repl ref={localReplRef} key="repl" pg={pg_lite} disableUpdateSchema={true} border={false} theme="auto" />
      </div>
    </div>
  )
}
