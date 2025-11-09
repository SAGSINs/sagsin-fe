import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { SocketConnection } from '@/socket/socket'
import type { Socket } from 'socket.io-client'

export interface Link {
  _id?: string
  srcNode: string
  destNode: string
  srcIp?: string
  destIp?: string
  available: boolean
  metrics?: {
    delayMs?: number
    jitterMs?: number
    bandwidthMbps?: number
    packetLoss?: number
    queueLength?: number
  }
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface LinkContextType {
  links: Link[]
  loading: boolean
  error: string | null
  getLinkById: (id: string) => Link | undefined
  getLinksByNode: (nodeIdentifier: string) => Link[]
  searchLinks: (srcQuery: string, destQuery: string) => Link[]
  refreshLinks: () => void
}

const LinkContext = createContext<LinkContextType | undefined>(undefined)

export function LinkProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const socket: Socket = SocketConnection.getInstance()

    const handleLinkUpdate = (data: any) => {
      setLoading(false)
      if (Array.isArray(data)) {
        setLinks(data)
      } else if (data) {
        setLinks((prev) => {
          const existing = prev.find((l) => l._id === data._id)
          if (existing) {
            return prev.map((l) => (l._id === data._id ? { ...l, ...data } : l))
          } else {
            return [...prev, data]
          }
        })
      }
    }

    const handleError = (err: any) => {
      setError(err?.message || 'Unknown error')
      setLoading(false)
    }

    socket.on('link-updated', handleLinkUpdate)
    socket.on('error', handleError)
    socket.emit('get-links')

    return () => {
      socket.off('link-updated', handleLinkUpdate)
      socket.off('error', handleError)
    }
  }, [])

  const getLinkById = (id: string) => {
    return links.find((l) => l._id === id)
  }

  const getLinksByNode = (nodeIdentifier: string) => {
    const identifier = nodeIdentifier.toLowerCase()
    return links.filter(
      (l) =>
        (l.srcNode || '').toLowerCase().includes(identifier) ||
        (l.destNode || '').toLowerCase().includes(identifier) ||
        (l.srcIp || '').toLowerCase().includes(identifier) ||
        (l.destIp || '').toLowerCase().includes(identifier)
    )
  }

  const searchLinks = (srcQuery: string, destQuery: string) => {
    const s = srcQuery.trim().toLowerCase()
    const d = destQuery.trim().toLowerCase()

    return links.filter((l) => {
      const src = (l.srcNode || '').toLowerCase()
      const dest = (l.destNode || '').toLowerCase()
      const srcIp = (l.srcIp || '').toLowerCase()
      const destIp = (l.destIp || '').toLowerCase()

      const srcOk = !s || src.includes(s) || srcIp.includes(s)
      const destOk = !d || dest.includes(d) || destIp.includes(d)
      return srcOk && destOk
    })
  }

  const refreshLinks = () => {
    setLoading(true)
    const socket: Socket = SocketConnection.getInstance()
    socket.emit('get-links')
  }

  return (
    <LinkContext.Provider
      value={{
        links,
        loading,
        error,
        getLinkById,
        getLinksByNode,
        searchLinks,
        refreshLinks,
      }}
    >
      {children}
    </LinkContext.Provider>
  )
}

export function useLinks() {
  const context = useContext(LinkContext)
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinkProvider')
  }
  return context
}
