'use client'

import React, { useRef, useEffect, useTransition, useState } from 'react'
import { resetRidersAction } from './actions'

interface ResetRidersDialogProps {
  currentCount: number
  onClose: () => void
  onSuccess?: () => void
}

export function ResetRidersDialog({ currentCount, onClose, onSuccess }: ResetRidersDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleReset = () => {
    setError(null)
    startTransition(async () => {
      const res = await resetRidersAction()
      if (res.ok) {
        onSuccess?.()
        onClose()
      } else {
        setError(res.error || 'Failed to reset riders')
      }
    })
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 max-w-md w-[92%] rounded-2xl border border-[#e5e2dc] bg-white shadow-2xl backdrop:bg-black/40"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#fdf0ee] text-[#c0392b] flex items-center justify-center text-xl font-bold">
          ⚠️
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a]">Reset Riders (6 → 0)</h3>
          <p className="text-xs text-[#5b5b5b]">Purge test riders for fresh onboarding</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#5b5b5b] mb-4 leading-relaxed">
        This will safely unlink any test shipments associated with test riders and permanently clear the <strong className="text-[#1a1a1a]">{currentCount} test rider records</strong> so the active rider count starts cleanly at <strong className="text-[#0f6e56]">0</strong>.
      </p>

      <p className="text-xs text-[#854f0b] bg-[#faeeda] p-3 rounded-xl mb-4 font-medium">
        New riders will onboard through the new <strong className="font-mono">RD-XXXX</strong> claim token system just like shop onboarding.
      </p>

      {error && (
        <p className="text-xs text-[#c0392b] bg-[#fdf0ee] p-2.5 rounded-xl mb-4">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-[#e5e2dc] rounded-xl text-xs sm:text-sm font-semibold text-[#5b5b5b] hover:bg-[#f7f7f5]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="px-5 py-2 bg-[#c0392b] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#a93226] disabled:opacity-50"
        >
          {isPending ? 'Resetting to 0…' : 'Confirm & Reset to 0'}
        </button>
      </div>
    </dialog>
  )
}
